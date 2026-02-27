"""End-to-end API test script."""
import urllib.request
import json
import time

BASE = "http://localhost:8000"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=body,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return resp.status, json.loads(resp.read())

def get(path):
    resp = urllib.request.urlopen(f"{BASE}{path}", timeout=15)
    return resp.status, json.loads(resp.read())

# ── TEST 1: Create Lead with AI Analysis ──
print("=" * 55)
print("TEST 1: POST /api/leads/ — Create + AI Analyze")
print("=" * 55)
try:
    status, result = post("/api/leads/", {
        "name": "Test Kumar",
        "phone": "9999888877",
        "budget": 8500000,
        "location": "HSR Layout, Bangalore",
        "timeline": "Immediately",
        "property_type": "3BHK",
        "loan_status": "Pre-approved",
        "message": "Looking for premium flat near tech park. Ready to buy immediately."
    })
    lead = result["lead"]
    ai = result["ai_analysis"]
    lead_id = lead["id"]
    print(f"  Status: {status} OK")
    print(f"  Lead ID: {lead_id}")
    print(f"  Score: {lead['score']} | Category: {lead['category']}")
    print(f"  Conversion: {ai['conversion_probability']}")
    print(f"  Summary: {ai['summary'][:100]}...")
    print(f"  Action: {ai['recommended_action'][:80]}...")
    print("  ✅ PASS\n")
except Exception as e:
    lead_id = None
    print(f"  ❌ FAIL: {e}\n")

# ── TEST 2: Get All Leads ──
print("=" * 55)
print("TEST 2: GET /api/leads/ — List Leads")
print("=" * 55)
try:
    status, result = get("/api/leads/")
    print(f"  Status: {status} OK")
    print(f"  Total leads: {len(result['leads'])}")
    print("  ✅ PASS\n")
except Exception as e:
    print(f"  ❌ FAIL: {e}\n")

# ── TEST 3: Get Single Lead ──
if lead_id:
    print("=" * 55)
    print(f"TEST 3: GET /api/leads/{lead_id} — Get Single Lead")
    print("=" * 55)
    try:
        status, result = get(f"/api/leads/{lead_id}")
        print(f"  Status: {status} OK")
        print(f"  Name: {result['name']} | Score: {result['score']}")
        print("  ✅ PASS\n")
    except Exception as e:
        print(f"  ❌ FAIL: {e}\n")

# ── TEST 4: Analyze Lead ──
if lead_id:
    print("=" * 55)
    print(f"TEST 4: POST /api/leads/{lead_id}/analyze — Re-Analyze")
    print("=" * 55)
    try:
        status, result = post(f"/api/leads/{lead_id}/analyze", {})
        print(f"  Status: {status} OK")
        print(f"  Score: {result['lead']['score']}")
        print(f"  Summary: {result['ai_analysis']['summary'][:100]}...")
        print("  ✅ PASS\n")
    except Exception as e:
        print(f"  ❌ FAIL: {e}\n")

# ── TEST 5: WhatsApp Follow-Up ──
if lead_id:
    print("=" * 55)
    print(f"TEST 5: POST /api/leads/{lead_id}/followup — WhatsApp")
    print("=" * 55)
    try:
        status, result = post(f"/api/leads/{lead_id}/followup", {})
        msg = result.get("whatsapp_message", "")
        print(f"  Status: {status} OK")
        print(f"  Message: {msg[:120]}...")
        print("  ✅ PASS\n")
    except Exception as e:
        print(f"  ❌ FAIL: {e}\n")

# ── TEST 6: No-Show Prediction ──
if lead_id:
    print("=" * 55)
    print(f"TEST 6: POST /api/leads/{lead_id}/no-show — Predict")
    print("=" * 55)
    try:
        status, result = post(f"/api/leads/{lead_id}/no-show", {})
        print(f"  Status: {status} OK")
        print(f"  Risk: {result}")
        print("  ✅ PASS\n")
    except Exception as e:
        print(f"  ❌ FAIL: {e}\n")

# ── TEST 7: Dashboard Analytics ──
print("=" * 55)
print("TEST 7: GET /api/analytics/dashboard — Metrics")
print("=" * 55)
try:
    status, result = get("/api/analytics/dashboard")
    print(f"  Status: {status} OK")
    print(f"  Total: {result['total_leads']} | Categories: {result['categories']}")
    print(f"  Avg Score: {result['avg_score']}")
    top = result.get("top_leads", [])
    if top:
        print(f"  Top lead: {top[0]['name']} (score={top[0]['score']}, location={top[0].get('location','-')})")
    print("  ✅ PASS\n")
except Exception as e:
    print(f"  ❌ FAIL: {e}\n")

# ── TEST 8: Conversion Funnel ──
print("=" * 55)
print("TEST 8: GET /api/analytics/conversion-funnel")
print("=" * 55)
try:
    status, result = get("/api/analytics/conversion-funnel")
    print(f"  Status: {status} OK")
    for stage in result["funnel"]:
        print(f"    {stage['stage']}: {stage['count']} ({stage['percentage']}%)")
    print("  ✅ PASS\n")
except Exception as e:
    print(f"  ❌ FAIL: {e}\n")

print("=" * 55)
print("ALL TESTS COMPLETE")
print("=" * 55)
