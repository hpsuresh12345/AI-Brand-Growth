"""
Create admin user for the application.
Run: python create_admin.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def create_admin():
    db = SessionLocal()
    try:
        # Check if admin already exists
        existing = db.query(User).filter(User.email == "admin@leadengine.com").first()
        
        if existing:
            print("✅ Admin user already exists!")
            print(f"   Email: {existing.email}")
            return
        
        # Create admin user
        admin = User(
            email="admin@leadengine.com",
            hashed_password=pwd_context.hash("admin123"),
            full_name="Admin User",
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Admin user created successfully!")
        print(f"   Email: admin@leadengine.com")
        print(f"   Password: admin123")
        print(f"\n🔐 Please change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
