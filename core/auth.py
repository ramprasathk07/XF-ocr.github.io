import os
from typing import Optional
from fastapi import Header, HTTPException, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from db.database import SessionLocal, User
from sqlalchemy.orm import Session

from dotenv import load_dotenv
load_dotenv()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def verify_google_token(authorization: Optional[str] = Header(None), origin: Optional[str] = Header(None)):
    if not authorization or " " not in authorization:
        # For testing purposes if no auth header
        return {"name": "Test User", "email": "test@example.com", "picture": ""}
        
    try:
        token = authorization.split(" ")[1]
        idinfo = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID, 
            clock_skew_in_seconds=60
        )
        
        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        # Sync user with database
        db = SessionLocal()
        try:
            db_user = db.query(User).filter(User.email == email).first()
            if not db_user:
                db_user = User(email=email, name=name, picture=picture)
                db.add(db_user)
            else:
                db_user.name = name
                db_user.picture = picture
            db.commit()
        finally:
            db.close()

        return {
            "name": name,
            "email": email,
            "picture": picture
        }
    except Exception as e:
        print(f"DEBUG: Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
