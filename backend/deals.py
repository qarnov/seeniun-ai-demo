"""
Seeniun Properties — Post-Sale Deal Tracker (demo data source)

In production this data would come from a Google Sheet that brokers update,
with n8n pushing changes here in real time. For the demo it's a self-contained
in-memory dataset so the dashboard always works with no external dependency.

Pipeline stages (index 0-4):
  0 Reservation  →  1 SPA Signed  →  2 DLD Registration  →  3 Construction  →  4 Handover
"""

STAGES = [
    {"key": "reservation", "label": "Reservation", "icon": "📝"},
    {"key": "spa", "label": "SPA Signed", "icon": "✍️"},
    {"key": "dld", "label": "DLD Registration", "icon": "🏛️"},
    {"key": "construction", "label": "Construction", "icon": "🏗️"},
    {"key": "handover", "label": "Handover", "icon": "🔑"},
]

DEALS = [
    {
        "id": "SN-2041",
        "client": "Rajesh Mehta",
        "property": "Marina Vista — 2BR, Dubai Marina",
        "developer": "Emaar",
        "value_aed": 2850000,
        "stage": 3,
        "updated": "2026-05-26",
        "next_milestone": "30% construction payment due 15 Jun 2026",
        "history": [
            {"stage": 0, "date": "2025-11-04", "note": "Booking form + AED 142.5k deposit received"},
            {"stage": 1, "date": "2025-11-21", "note": "SPA signed, Oqood initiated"},
            {"stage": 2, "date": "2025-12-09", "note": "DLD registered, 4% fee paid"},
            {"stage": 3, "date": "2026-03-18", "note": "Foundation complete, 40% built"},
        ],
    },
    {
        "id": "SN-2058",
        "client": "Sophie Laurent",
        "property": "Creek Horizon — 1BR, Dubai Creek Harbour",
        "developer": "Emaar",
        "value_aed": 1650000,
        "stage": 4,
        "updated": "2026-05-22",
        "next_milestone": "Keys collected — handover complete 🎉",
        "history": [
            {"stage": 0, "date": "2024-06-12", "note": "Reservation confirmed"},
            {"stage": 1, "date": "2024-07-01", "note": "SPA executed"},
            {"stage": 2, "date": "2024-07-19", "note": "DLD title pre-registered"},
            {"stage": 3, "date": "2025-10-30", "note": "Construction 100% — snagging passed"},
            {"stage": 4, "date": "2026-05-22", "note": "Handover complete, title deed issued"},
        ],
    },
    {
        "id": "SN-2063",
        "client": "Ahmed Al-Rashid",
        "property": "Damac Lagoons — 4BR Villa, Dubailand",
        "developer": "DAMAC",
        "value_aed": 4200000,
        "stage": 1,
        "updated": "2026-05-27",
        "next_milestone": "DLD registration appointment 03 Jun 2026",
        "history": [
            {"stage": 0, "date": "2026-04-28", "note": "Reservation + AED 210k deposit"},
            {"stage": 1, "date": "2026-05-19", "note": "SPA signed, awaiting DLD slot"},
        ],
    },
    {
        "id": "SN-2070",
        "client": "Chen Wei",
        "property": "Sobha Hartland II — 3BR, MBR City",
        "developer": "Sobha",
        "value_aed": 3450000,
        "stage": 0,
        "updated": "2026-05-28",
        "next_milestone": "SPA to be issued within 14 days",
        "history": [
            {"stage": 0, "date": "2026-05-28", "note": "Reservation confirmed, KYC in progress"},
        ],
    },
    {
        "id": "SN-2055",
        "client": "Elena Petrova",
        "property": "Bluewaters Bay — 2BR, Bluewaters Island",
        "developer": "Meraas",
        "value_aed": 3980000,
        "stage": 2,
        "updated": "2026-05-24",
        "next_milestone": "First construction milestone Q3 2026",
        "history": [
            {"stage": 0, "date": "2026-01-15", "note": "Reservation confirmed"},
            {"stage": 1, "date": "2026-02-02", "note": "SPA signed"},
            {"stage": 2, "date": "2026-02-20", "note": "DLD registered, Oqood issued"},
        ],
    },
    {
        "id": "SN-2068",
        "client": "James Okafor",
        "property": "Azizi Riviera — Studio, Meydan",
        "developer": "Azizi",
        "value_aed": 720000,
        "stage": 3,
        "updated": "2026-05-25",
        "next_milestone": "Anticipated handover Q4 2026",
        "history": [
            {"stage": 0, "date": "2025-08-09", "note": "Reservation confirmed"},
            {"stage": 1, "date": "2025-08-27", "note": "SPA signed"},
            {"stage": 2, "date": "2025-09-14", "note": "DLD registered"},
            {"stage": 3, "date": "2026-02-11", "note": "Construction 75% complete"},
        ],
    },
]


def get_deals() -> dict:
    """Return the full pipeline payload: stages, deals, and summary stats."""
    total_value = sum(d["value_aed"] for d in DEALS)
    by_stage = [0] * len(STAGES)
    for d in DEALS:
        by_stage[d["stage"]] += 1

    return {
        "stages": STAGES,
        "deals": DEALS,
        "summary": {
            "total_deals": len(DEALS),
            "total_value_aed": total_value,
            "by_stage": by_stage,
            "handovers_complete": sum(1 for d in DEALS if d["stage"] == 4),
        },
    }
