"""
Price Intelligence Service
Core component for building price history and identifying savings opportunities
"""

import asyncio
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
from decimal import Decimal
import asyncpg
from asyncpg.pool import Pool
from receipt_parser import ReceiptData, ReceiptItem

# Try to import BUSINESS_RULES, with fallback
try:
    from constants import BUSINESS_RULES
    MAX_CONNECTIONS = BUSINESS_RULES.DATABASE.MAX_CONNECTIONS
except (ImportError, AttributeError):
    MAX_CONNECTIONS = 10  # Default fallback

logger = logging.getLogger(__name__)

@dataclass
class PricePoint:
    store_id: str
    item_name: str
    price: Decimal
    date: datetime
    source: str = 'receipt'
    confidence: float = 1.0

@dataclass
class SavingsOpportunity:
    item_name: str
    current_price: Decimal
    best_price: Decimal
    savings: Decimal
    store_name: str
    confidence: float
    price_history_points: int

@dataclass
class BasketAnalysis:
    total_savings: Decimal
    savings_opportunities: List[SavingsOpportunity]
    store_recommendation: Optional[str]
    cashback_available: Decimal

class PriceIntelligenceService:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self._pool: Pool | None = None

    async def _get_pool(self) -> Pool:
        """Get or create an asyncpg connection pool."""
        if self._pool is None:
            try:
                self._pool = await asyncpg.create_pool(
                    self.db_url,
                    min_size=5,
                    max_size=MAX_CONNECTIONS,
                )
                logger.info("Successfully created asyncpg connection pool.")
            except Exception as e:
                logger.error(f"Failed to create asyncpg connection pool: {e}")
                raise
        return self._pool

    async def close_pool(self):
        """Close the connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None
            logger.info("Asyncpg connection pool closed.")

    async def store_receipt_prices(self, receipt_data: ReceiptData, store_id: str, user_id: str) -> bool:
        """Store prices from a receipt into price history using an atomic transaction."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            async with conn.transaction():
                try:
                    for item in receipt_data.items:
                        normalized_name = self._normalize_item_name(item.name)
                        await conn.execute(
                            """
                            INSERT INTO price_history (store_id, item_name, price, date, source, confidence_score)
                            VALUES ($1, $2, $3, $4, $5, $6)
                            ON CONFLICT (store_id, item_name, date, source)
                            DO UPDATE SET
                                price = EXCLUDED.price,
                                confidence_score = EXCLUDED.confidence_score
                            """,
                            store_id,
                            normalized_name,
                            item.price,
                            receipt_data.date or datetime.now().date(),
                            "receipt",
                            item.confidence,
                        )
                    await self._create_basket_snapshot(conn, receipt_data, store_id, user_id)
                    logger.info(f"Stored {len(receipt_data.items)} price points for store {store_id}")
                    return True
                except Exception as e:
                    logger.error(f"Error storing receipt prices: {e}")
                    # The transaction will be rolled back automatically
                    return False

    async def analyze_basket_savings(self, items: list[ReceiptItem], store_id: str, user_location: tuple[float, float] | None = None) -> BasketAnalysis:
        """Analyze basket for savings opportunities."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            try:
                savings_opportunities = []
                total_savings = Decimal("0.00")

                for item in items:
                    normalized_name = self._normalize_item_name(item.name)
                    result = await conn.fetchrow(
                        """
                        SELECT
                            s.name as store_name,
                            ph.price,
                            ph.confidence_score,
                            COUNT(*) OVER (PARTITION BY ph.item_name) as price_history_points
                        FROM price_history ph
                        JOIN stores s ON ph.store_id = s.id
                        WHERE ph.item_name ILIKE $1
                        AND ph.date >= CURRENT_DATE - INTERVAL '30 days'
                        AND s.is_active = true
                        ORDER BY ph.price ASC
                        LIMIT 1
                        """,
                        f"%{normalized_name}%",
                    )
                    if result and result["price"] < item.price:
                        savings = item.price - result["price"]
                        savings_opportunities.append(
                            SavingsOpportunity(
                                item_name=item.name,
                                current_price=item.price,
                                best_price=result["price"],
                                savings=savings,
                                store_name=result["store_name"],
                                confidence=result["confidence_score"],
                                price_history_points=result["price_history_points"],
                            )
                        )
                        total_savings += savings
                
                store_recommendation = await self._get_store_recommendation(conn, items, user_location)
                cashback_available = await self._calculate_cashback_opportunities(conn, items, store_id)

                return BasketAnalysis(
                    total_savings=total_savings,
                    savings_opportunities=savings_opportunities,
                    store_recommendation=store_recommendation,
                    cashback_available=cashback_available,
                )
            except Exception as e:
                logger.error(f"Error analyzing basket savings: {e}")
                return BasketAnalysis(Decimal("0.00"), [], None, Decimal("0.00"))

    async def get_price_history(self, item_name: str, store_id: str | None = None, days: int = 90) -> list[dict]:
        """Get price history for an item."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            try:
                normalized_name = self._normalize_item_name(item_name)
                query = """
                    SELECT ph.price, ph.date, ph.confidence_score, s.name as store_name
                    FROM price_history ph
                    JOIN stores s ON ph.store_id = s.id
                    WHERE ph.item_name ILIKE $1 AND ($2::UUID IS NULL OR ph.store_id = $2)
                    AND ph.date >= CURRENT_DATE - INTERVAL '1 day' * $3
                    ORDER BY ph.date ASC
                """
                results = await conn.fetch(query, f"%{normalized_name}%", store_id, days)
                return [dict(row) for row in results]
            except Exception as e:
                logger.error(f"Error getting price history: {e}")
                return []

    async def get_store_price_comparison(self, item_name: str) -> list[dict]:
        """Compare prices across stores for an item."""
        pool = await self._get_pool()
        async with pool.acquire() as conn:
            try:
                normalized_name = self._normalize_item_name(item_name)
                query = """
                    SELECT s.name as store_name, MIN(ph.price) as best_price, MAX(ph.price) as highest_price, AVG(ph.price) as average_price
                    FROM price_history ph
                    JOIN stores s ON ph.store_id = s.id
                    WHERE ph.item_name ILIKE $1
                    AND ph.date >= CURRENT_DATE - INTERVAL '30 days'
                    GROUP BY s.name
                    ORDER BY average_price ASC
                """
                results = await conn.fetch(query, f"%{normalized_name}%")
                return [dict(row) for row in results]
            except Exception as e:
                logger.error(f"Error getting store price comparison: {e}")
                return []

    async def _create_basket_snapshot(self, conn: asyncpg.Connection, receipt_data: ReceiptData, store_id: str, user_id: str):
        """Create anonymized basket snapshot for B2B data. Assumes it's called within a transaction."""
        try:
            anonymized_id_row = await conn.fetchrow("SELECT anonymized_id FROM users WHERE id = $1", user_id)
            if not anonymized_id_row:
                logger.warn(f"No anonymized_id found for user_id {user_id}")
                return

            anonymized_id = anonymized_id_row['anonymized_id']
            anonymized_items = [
                {"name": self._normalize_item_name(item.name), "price": float(item.price)}
                for item in receipt_data.items
            ]

            await conn.execute(
                """
                INSERT INTO basket_snapshots (user_anonymized_id, store_id, total_amount, item_count, date, items)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                anonymized_id,
                store_id,
                receipt_data.total or 0,
                len(receipt_data.items),
                receipt_data.date or datetime.now().date(),
                json.dumps(anonymized_items),
            )
        except Exception as e:
            logger.error(f"Error creating basket snapshot: {e}")
            # Do not re-raise, to avoid breaking the main transaction
    
    async def _get_store_recommendation(self, conn: asyncpg.Connection, items: list[ReceiptItem], user_location: tuple[float, float] | None) -> str | None:
        """Get store recommendation based on basket and location."""
        try:
            total_savings_by_store = {}
            for item in items:
                normalized_name = self._normalize_item_name(item.name)
                result = await conn.fetchrow(
                    """
                    SELECT s.name, ph.price FROM price_history ph
                    JOIN stores s ON ph.store_id = s.id
                    WHERE ph.item_name ILIKE $1
                    AND ph.date >= CURRENT_DATE - INTERVAL '30 days'
                    AND s.is_active = true
                    ORDER BY ph.price ASC LIMIT 1
                    """,
                    f"%{normalized_name}%",
                )
                if result and result['price'] < item.price:
                    store_name = result['name']
                    savings = item.price - result['price']
                    total_savings_by_store[store_name] = total_savings_by_store.get(store_name, Decimal("0.0")) + savings

            if not total_savings_by_store:
                return None
            
            return max(total_savings_by_store, key=total_savings_by_store.get)
        except Exception as e:
            logger.error(f"Error getting store recommendation: {e}")
            return None

    async def _calculate_cashback_opportunities(self, conn: asyncpg.Connection, items: list[ReceiptItem], store_id: str) -> Decimal:
        """Calculate available cashback for items."""
        try:
            total_cashback = Decimal("0.00")
            for item in items:
                normalized_name = self._normalize_item_name(item.name)
                result = await conn.fetchrow(
                    """
                    SELECT discount_amount, discount_percentage FROM cashback_offers
                    WHERE (item_name ILIKE $1 OR item_name IS NULL)
                    AND store_id = $2
                    AND is_active = true AND valid_from <= CURRENT_DATE AND valid_until >= CURRENT_DATE
                    ORDER BY COALESCE(discount_amount, $3 * discount_percentage / 100) DESC
                    LIMIT 1
                    """,
                    f"%{normalized_name}%",
                    store_id,
                    item.price,
                )
                if result:
                    if result['discount_amount']:
                        total_cashback += result['discount_amount']
                    elif result['discount_percentage']:
                        total_cashback += item.price * result['discount_percentage'] / 100
            return total_cashback
        except Exception as e:
            logger.error(f"Error calculating cashback: {e}")
            return Decimal("0.00")
    
    def _normalize_item_name(self, item_name: str) -> str:
        """Normalize item name for better matching"""
        # Remove common prefixes/suffixes, standardize formatting
        normalized = item_name.lower().strip()
        
        # Remove common words that don't help with matching
        stop_words = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
        words = normalized.split()
        words = [w for w in words if w not in stop_words and len(w) > 2]
        
        return ' '.join(words)
    
    def _get_price_range(self, price: float) -> str:
        """Convert price to range for anonymization"""
        if price < 5:
            return '0-5'
        elif price < 10:
            return '5-10'
        elif price < 20:
            return '10-20'
        elif price < 50:
            return '20-50'
        else:
            return '50+' 