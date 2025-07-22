# ReceiptRadar: Path to Success – Actionable Roadmap

## 1. Summary & Success Odds

ReceiptRadar's odds of breakout success are non-zero but low by default. Success depends on nailing a few critical areas:

- **Breakout ($10k+ MRR, >30% D30 retention):** 5–10%
- **Side-income ($1–3k MRR, niche cult):** 25–35%
- **Zombie (<$500 MRR, usage fizzles):** 55–65%
- **Dead on arrival:** 10%

**You move the odds by nailing:**

- Pain (real user need)
- Friction (ease of use)
- Distribution (getting users)

## 2. Critical Choke Points

### 1. OCR & Item Normalisation

- 95%+ receipt parse success or a painless manual fix flow.
- SKU clustering: "milk" vs "anchor trim 2L" → same bucket. Build/borrow a taxonomy + fuzzy matching, cache per user.

### 2. Sync/State Reliability

- Offline queue, retry logic, diff syncing. No data loss. Ever.
- Deterministic charts: the same totals every time the user opens the app.

### 3. Speed & UX Loop

- Scan to insight <10 seconds.
- "Add receipt" is one tap from home screen (widget/shortcut).

### 4. Insight Quality

- Not "you spent $123 at Countdown" (they know).
- "You overshot snacks budget by 37% this month; here's the culprit items" / "Prices rose 12% YoY on produce you buy".

## 3. Pre-mortem: Why Most Apps Fail

- Acquisition friction: no one wants another tracking app; grocery pain isn't acute enough without a hook.
- Data mess: OCR errors → user distrust → churn.
- No network effect: single-player finance apps fight retention uphill.
- Competitor parity: Grocer/Grosave ship a cleaner API-backed deal feed; you look redundant.
- You lose steam after v1 because data-cleaning is grimy, not sexy.

## 4. Concrete Moves to Improve Odds

### 1. Sharp Positioning

- "Your grocery copilot" not "budget app".
- Promise one hero outcome: "cut $40/week off your shop in 4 weeks" or "never wonder where the $$ went again".

### 2. Hook + Habit Loop

- Hook: fun scan animation + instant wormy insight meme-able screenshot.
- Habit: weekly digest ("$xx on snacks, +12% from last week"), push once/week, opt-in.

### 3. Wedge Features Competitors Don't Have

- Social/competitive angle: anonymous city-wide averages: "You pay 17% more for oats than the median Aucklander".
- Shareable receipts: frictionless export to partner/flat chat.
- MapKit "cheapest basket near you" (if you can source enough data → even through user receipts).

### 4. Data Quality Hacks

- Allow photo gallery import + batch processing.
- Manual correction is gamified (XP for confirming items).
- Use LLM fuzzy matching + cached embeddings to normalise items quickly.

### 5. Distribution Channels

- r/PersonalFinanceNZ, r/frugal, TikTok "grocery hacks", mom blogs, student FB groups.
- Launch cheap on PH/HN to catch techies, but pivot messaging for civilians.

## 5. Execution Roadmap

### Q3 2025 (now):

- Ship scanner + basic dashboard + weekly digest.
- Instrument everything (Mixpanel/Telemetry).
- 50 beta users, rapid iteration.

### Q4 2025:

- Normalisation engine v2, insights v1, sharing.
- Paywall careful: free core, pro insights/export.
- Target $250 MRR.

### 2026:

- Double down on retention levers or pivot to B2B (grocers, budgeting coaches) if consumer stalls.
- Consider "ReceiptRadar for Flatmates" plan.
- $1k MRR or reassess.

## 6. Key Metrics & Kill/Pivot Thresholds

- **Receipt-to-active-user ratio:** ≥2 receipts/user/week after week 4.
- **D7 retention:** ≥35%, **D30:** ≥20%.
- **Correction rate:** <15% of items need manual fix after month 2.
- **Share events/imports:** >25% of users (shows viral/utilitarian pull).
- **MRR path:** $250 → $500 → $1k over 3 consecutive months.

**If you're under these, either pivot positioning or kill it.**

## 7. Next Steps

1. **Set up a KPI dashboard** (Notion, Mixpanel, or similar) to track the above metrics.
2. **Prioritize engineering sprints** around the 4 choke points (OCR, reliability, speed, insight quality).
3. **Run a competitive teardown** of Grosave/Grocer UX flows to find your wedge.
4. **Plan distribution**: Identify and prepare posts/launches for key communities.
5. **Instrument analytics**: Ensure you can measure all leading indicators from day one.

---

**Brutal Simplifier:**
If you can't guarantee: "Scan a receipt, instantly trust the numbers, and get a weekly 'do X to save Y' nudge," you're a toy. Build toward that or kill quick.
