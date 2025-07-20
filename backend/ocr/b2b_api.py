"""
B2B API Service
Provides anonymized basket intelligence and price data to FMCG companies and hedge funds
"""

import asyncio
import logging
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
import json
import hashlib
import hmac
import time
from decimal import Decimal
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

logger = logging.getLogger(__name__)

@dataclass
class APIKey:
    id: str
    client_name: str
    permissions: Dict[str, Any]
    rate_limit: int
    last_used: Optional[datetime]

class BasketIntelligenceAPI:
    def __init__(self, db_url: str):
        self.db_url = db_url
        self.app = FastAPI(
            title="ReceiptRadar B2B API",
            description="Anonymized basket intelligence and price data for FMCG companies",
            version="2.0.0"
        )
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup API routes"""
        
        @self.app.get("/health")
        async def health_check():
            return {"status": "healthy", "service": "b2b-api"}
        
        @self.app.get("/basket-intelligence/summary")
        async def get_basket_summary(
            start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
            end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
            store_id: Optional[str] = Query(None, description="Filter by store"),
            category: Optional[str] = Query(None, description="Filter by category"),
            api_key: str = Header(..., alias="X-API-Key")
        ):
            """Get anonymized basket intelligence summary"""
            await self._validate_api_key(api_key, "basket_intelligence")
            
            try:
                summary = await self._get_basket_summary(start_date, end_date, store_id, category)
                return summary
            except Exception as e:
                logger.error(f"Error getting basket summary: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/basket-intelligence/trends")
        async def get_basket_trends(
            category: str = Query(..., description="Product category"),
            days: int = Query(30, description="Number of days to analyze"),
            store_id: Optional[str] = Query(None, description="Filter by store"),
            api_key: str = Header(..., alias="X-API-Key")
        ):
            """Get basket composition trends for a category"""
            await self._validate_api_key(api_key, "basket_intelligence")
            
            try:
                trends = await self._get_basket_trends(category, days, store_id)
                return trends
            except Exception as e:
                logger.error(f"Error getting basket trends: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/price-intelligence/summary")
        async def get_price_summary(
            item_name: str = Query(..., description="Item name to analyze"),
            store_id: Optional[str] = Query(None, description="Filter by store"),
            days: int = Query(90, description="Number of days to analyze"),
            api_key: str = Header(..., alias="X-API-Key")
        ):
            """Get price intelligence summary for an item"""
            await self._validate_api_key(api_key, "price_intelligence")
            
            try:
                summary = await self._get_price_summary(item_name, store_id, days)
                return summary
            except Exception as e:
                logger.error(f"Error getting price summary: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/price-intelligence/competition")
        async def get_price_competition(
            item_name: str = Query(..., description="Item name to analyze"),
            api_key: str = Header(..., alias="X-API-Key")
        ):
            """Get price competition analysis across stores"""
            await self._validate_api_key(api_key, "price_intelligence")
            
            try:
                competition = await self._get_price_competition(item_name)
                return competition
            except Exception as e:
                logger.error(f"Error getting price competition: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/demand-pulse/category")
        async def get_demand_pulse(
            category: str = Query(..., description="Product category"),
            days: int = Query(7, description="Number of days to analyze"),
            store_id: Optional[str] = Query(None, description="Filter by store"),
            api_key: str = Header(..., alias="X-API-Key")
        ):
            """Get demand pulse for a category (48-hour latency)"""
            await self._validate_api_key(api_key, "demand_pulse")
            
            try:
                pulse = await self._get_demand_pulse(category, days, store_id)
                return pulse
            except Exception as e:
                logger.error(f"Error getting demand pulse: {e}")
                raise HTTPException(status_code=500, detail=str(e))
    
    async def _validate_api_key(self, api_key: str, required_permission: str):
        """Validate API key and check permissions"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Hash the provided API key
            key_hash = hashlib.sha256(api_key.encode()).hexdigest()
            
            cursor.execute("""
                SELECT id, client_name, permissions, rate_limit, last_used_at
                FROM api_keys
                WHERE api_key_hash = %s AND is_active = true
            """, (key_hash,))
            
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=401, detail="Invalid API key")
            
            # Check permissions
            permissions = result['permissions']
            if required_permission not in permissions.get('access', []):
                raise HTTPException(status_code=403, detail=f"Access denied to {required_permission}")
            
            # Check rate limit
            if result['last_used_at']:
                time_diff = datetime.now() - result['last_used_at']
                if time_diff.total_seconds() < 3600:  # 1 hour window
                    # In production, implement proper rate limiting
                    pass
            
            # Update last used
            cursor.execute("""
                UPDATE api_keys SET last_used_at = NOW() WHERE id = %s
            """, (result['id'],))
            
            conn.commit()
            cursor.close()
            conn.close()
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error validating API key: {e}")
            raise HTTPException(status_code=500, detail="Authentication error")
    
    async def _get_basket_summary(self, start_date: str, end_date: str, store_id: Optional[str], category: Optional[str]) -> Dict:
        """Get anonymized basket intelligence summary"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Build query with filters
            query = """
                SELECT 
                    COUNT(*) as basket_count,
                    AVG(total_amount) as avg_basket_value,
                    AVG(item_count) as avg_items_per_basket,
                    SUM(total_amount) as total_spend,
                    COUNT(DISTINCT user_anonymized_id) as unique_shoppers
                FROM basket_snapshots
                WHERE date BETWEEN %s AND %s
            """
            params = [start_date, end_date]
            
            if store_id:
                query += " AND store_id = %s"
                params.append(store_id)
            
            if category:
                query += " AND items::text ILIKE %s"
                params.append(f'%"category": "{category}"%')
            
            cursor.execute(query, params)
            result = cursor.fetchone()
            
            # Get top categories
            category_query = """
                SELECT 
                    jsonb_array_elements(items)->>'category' as category,
                    COUNT(*) as frequency
                FROM basket_snapshots
                WHERE date BETWEEN %s AND %s
            """
            category_params = [start_date, end_date]
            
            if store_id:
                category_query += " AND store_id = %s"
                category_params.append(store_id)
            
            category_query += """
                GROUP BY category
                ORDER BY frequency DESC
                LIMIT 10
            """
            
            cursor.execute(category_query, category_params)
            top_categories = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                "period": {"start_date": start_date, "end_date": end_date},
                "summary": {
                    "basket_count": result['basket_count'],
                    "avg_basket_value": float(result['avg_basket_value']),
                    "avg_items_per_basket": float(result['avg_items_per_basket']),
                    "total_spend": float(result['total_spend']),
                    "unique_shoppers": result['unique_shoppers']
                },
                "top_categories": [
                    {"category": cat['category'], "frequency": cat['frequency']}
                    for cat in top_categories if cat['category']
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting basket summary: {e}")
            raise
    
    async def _get_basket_trends(self, category: str, days: int, store_id: Optional[str]) -> Dict:
        """Get basket composition trends for a category"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    date,
                    COUNT(*) as basket_count,
                    AVG(total_amount) as avg_basket_value,
                    AVG(item_count) as avg_items_per_basket
                FROM basket_snapshots
                WHERE date >= CURRENT_DATE - INTERVAL '%s days'
                AND items::text ILIKE %s
            """
            params = [days, f'%"category": "{category}"%']
            
            if store_id:
                query += " AND store_id = %s"
                params.append(store_id)
            
            query += " GROUP BY date ORDER BY date"
            
            cursor.execute(query, params)
            trends = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                "category": category,
                "period_days": days,
                "trends": [
                    {
                        "date": trend['date'].isoformat(),
                        "basket_count": trend['basket_count'],
                        "avg_basket_value": float(trend['avg_basket_value']),
                        "avg_items_per_basket": float(trend['avg_items_per_basket'])
                    }
                    for trend in trends
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting basket trends: {e}")
            raise
    
    async def _get_price_summary(self, item_name: str, store_id: Optional[str], days: int) -> Dict:
        """Get price intelligence summary for an item"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT 
                    s.name as store_name,
                    AVG(ph.price) as avg_price,
                    MIN(ph.price) as min_price,
                    MAX(ph.price) as max_price,
                    COUNT(*) as price_points,
                    STDDEV(ph.price) as price_volatility
                FROM price_history ph
                JOIN stores s ON ph.store_id = s.id
                WHERE ph.item_name ILIKE %s
                AND ph.date >= CURRENT_DATE - INTERVAL '%s days'
            """
            params = [f'%{item_name}%', days]
            
            if store_id:
                query += " AND ph.store_id = %s"
                params.append(store_id)
            
            query += " GROUP BY s.name ORDER BY avg_price"
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            cursor.close()
            conn.close()
            
            return {
                "item_name": item_name,
                "period_days": days,
                "price_summary": [
                    {
                        "store_name": result['store_name'],
                        "avg_price": float(result['avg_price']),
                        "min_price": float(result['min_price']),
                        "max_price": float(result['max_price']),
                        "price_points": result['price_points'],
                        "price_volatility": float(result['price_volatility']) if result['price_volatility'] else 0
                    }
                    for result in results
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting price summary: {e}")
            raise
    
    async def _get_price_competition(self, item_name: str) -> Dict:
        """Get price competition analysis across stores"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Get current prices across stores
            query = """
                SELECT 
                    s.name as store_name,
                    ph.price,
                    ph.date,
                    ph.confidence_score
                FROM price_history ph
                JOIN stores s ON ph.store_id = s.id
                WHERE ph.item_name ILIKE %s
                AND ph.date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY ph.price ASC
            """
            
            cursor.execute(query, [f'%{item_name}%'])
            results = cursor.fetchall()
            
            # Group by store and get latest price
            store_prices = {}
            for result in results:
                store_name = result['store_name']
                if store_name not in store_prices or result['date'] > store_prices[store_name]['date']:
                    store_prices[store_name] = {
                        "price": float(result['price']),
                        "date": result['date'].isoformat(),
                        "confidence": result['confidence_score']
                    }
            
            # Calculate competition metrics
            prices = [data['price'] for data in store_prices.values()]
            if prices:
                min_price = min(prices)
                max_price = max(prices)
                avg_price = sum(prices) / len(prices)
                price_range = max_price - min_price
                price_variance = sum((p - avg_price) ** 2 for p in prices) / len(prices)
            else:
                min_price = max_price = avg_price = price_range = price_variance = 0
            
            cursor.close()
            conn.close()
            
            return {
                "item_name": item_name,
                "competition_metrics": {
                    "store_count": len(store_prices),
                    "min_price": min_price,
                    "max_price": max_price,
                    "avg_price": avg_price,
                    "price_range": price_range,
                    "price_variance": price_variance
                },
                "store_prices": [
                    {
                        "store_name": store_name,
                        "price": data['price'],
                        "date": data['date'],
                        "confidence": data['confidence']
                    }
                    for store_name, data in store_prices.items()
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting price competition: {e}")
            raise
    
    async def _get_demand_pulse(self, category: str, days: int, store_id: Optional[str]) -> Dict:
        """Get demand pulse for a category (48-hour latency)"""
        try:
            conn = psycopg2.connect(self.db_url)
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Get demand data with 48-hour delay
            query = """
                SELECT 
                    date,
                    COUNT(*) as demand_count,
                    AVG(total_amount) as avg_basket_value,
                    COUNT(DISTINCT user_anonymized_id) as unique_shoppers
                FROM basket_snapshots
                WHERE date >= CURRENT_DATE - INTERVAL '%s days'
                AND date <= CURRENT_DATE - INTERVAL '2 days'
                AND items::text ILIKE %s
            """
            params = [days, f'%"category": "{category}"%']
            
            if store_id:
                query += " AND store_id = %s"
                params.append(store_id)
            
            query += " GROUP BY date ORDER BY date"
            
            cursor.execute(query, params)
            demand_data = cursor.fetchall()
            
            # Calculate demand pulse metrics
            if demand_data:
                recent_demand = sum(d['demand_count'] for d in demand_data[-7:])  # Last 7 days
                previous_demand = sum(d['demand_count'] for d in demand_data[-14:-7])  # Previous 7 days
                
                if previous_demand > 0:
                    demand_change = ((recent_demand - previous_demand) / previous_demand) * 100
                else:
                    demand_change = 0
            else:
                demand_change = 0
            
            cursor.close()
            conn.close()
            
            return {
                "category": category,
                "period_days": days,
                "demand_pulse": {
                    "current_demand": recent_demand if demand_data else 0,
                    "previous_demand": previous_demand if demand_data else 0,
                    "demand_change_percent": demand_change,
                    "trend": "increasing" if demand_change > 5 else "decreasing" if demand_change < -5 else "stable"
                },
                "daily_demand": [
                    {
                        "date": data['date'].isoformat(),
                        "demand_count": data['demand_count'],
                        "avg_basket_value": float(data['avg_basket_value']),
                        "unique_shoppers": data['unique_shoppers']
                    }
                    for data in demand_data
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting demand pulse: {e}")
            raise

# Create FastAPI app instance
b2b_api = BasketIntelligenceAPI(os.getenv('DATABASE_URL', 'postgresql://localhost/receiptradar'))
app = b2b_api.app 