"""
Seed script — inserts 8 realistic dummy leads into the database.
Run:  py seed_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import engine, SessionLocal
from app.models.lead import Lead, Base

# Create tables if not already there
Base.metadata.create_all(bind=engine)

LEADS = [
    {
        "name": "Priya Menon",
        "phone": "9845012345",
        "budget": 12000000,
        "location": "Indiranagar, Bangalore",
        "timeline": "Immediately",
        "property_type": "3BHK",
        "loan_status": "Pre-approved",
        "message": "Relocating from Chennai, need a premium 3BHK near metro. Budget flexible up to 1.5Cr.",
        "score": 92,
        "category": "Hot",
        "conversion_probability": 0.88,
        "no_show_risk": 0.12,
    },
    {
        "name": "Amit Verma",
        "phone": "9912345678",
        "budget": 8500000,
        "location": "Whitefield, Bangalore",
        "timeline": "1-3 months",
        "property_type": "3BHK",
        "loan_status": "In progress",
        "message": "Looking for a family-friendly 3BHK in a gated community with good schools nearby.",
        "score": 76,
        "category": "Warm",
        "conversion_probability": 0.62,
        "no_show_risk": 0.30,
    },
    {
        "name": "Deepa Krishnan",
        "phone": "9876501234",
        "budget": 25000000,
        "location": "Koramangala, Bangalore",
        "timeline": "Immediately",
        "property_type": "Villa",
        "loan_status": "Pre-approved",
        "message": "Want a premium villa with garden. Cash buyer, can close within 2 weeks.",
        "score": 97,
        "category": "Hot",
        "conversion_probability": 0.95,
        "no_show_risk": 0.05,
    },
    {
        "name": "Rajesh Gupta",
        "phone": "9834567890",
        "budget": 4500000,
        "location": "Electronic City, Bangalore",
        "timeline": "3-6 months",
        "property_type": "2BHK",
        "loan_status": "Not started",
        "message": "First-time buyer, exploring options near my office in Electronic City.",
        "score": 45,
        "category": "Cold",
        "conversion_probability": 0.25,
        "no_show_risk": 0.55,
    },
    {
        "name": "Sneha Patel",
        "phone": "9900123456",
        "budget": 9500000,
        "location": "HSR Layout, Bangalore",
        "timeline": "1-3 months",
        "property_type": "3BHK",
        "loan_status": "Applied",
        "message": "Startup founder, want a spacious flat with home office space. Prefer higher floors.",
        "score": 71,
        "category": "Warm",
        "conversion_probability": 0.58,
        "no_show_risk": 0.28,
    },
    {
        "name": "Vikram Singh",
        "phone": "9811234567",
        "budget": 35000000,
        "location": "Sadashivanagar, Bangalore",
        "timeline": "Immediately",
        "property_type": "Villa",
        "loan_status": "Pre-approved",
        "message": "NRI returning to India. Want a luxury villa with modern amenities. Money is not a constraint.",
        "score": 95,
        "category": "Hot",
        "conversion_probability": 0.91,
        "no_show_risk": 0.08,
    },
    {
        "name": "Kavya Nair",
        "phone": "9867890123",
        "budget": 3200000,
        "location": "Yelahanka, Bangalore",
        "timeline": "6+ months",
        "property_type": "1BHK",
        "loan_status": "Not started",
        "message": "Just started exploring. Looking for a small 1BHK for investment purposes.",
        "score": 32,
        "category": "Cold",
        "conversion_probability": 0.15,
        "no_show_risk": 0.65,
    },
    {
        "name": "Arjun Reddy",
        "phone": "9823456789",
        "budget": 15000000,
        "location": "JP Nagar, Bangalore",
        "timeline": "1-3 months",
        "property_type": "3BHK",
        "loan_status": "Pre-approved",
        "message": "Upgrading from 2BHK. Need a 3BHK with gym and swimming pool in the complex.",
        "score": 82,
        "category": "Hot",
        "conversion_probability": 0.78,
        "no_show_risk": 0.18,
    },
]

def seed():
    db = SessionLocal()
    try:
        existing = db.query(Lead).count()
        if existing > 0:
            print(f"Database already has {existing} leads. Adding {len(LEADS)} more...")
        
        for lead_data in LEADS:
            lead = Lead(**lead_data)
            db.add(lead)
        
        db.commit()
        total = db.query(Lead).count()
        print(f"Seeded {len(LEADS)} leads. Total in DB: {total}")
        
        # Print summary
        for cat in ["Hot", "Warm", "Cold"]:
            count = db.query(Lead).filter(Lead.category == cat).count()
            print(f"  {cat}: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
