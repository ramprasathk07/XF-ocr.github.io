from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
from db.config import config

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True)
    name = Column(String)
    picture = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    requests = relationship("OCRRequest", back_populates="user")

class OCRRequest(Base):
    __tablename__ = "ocr_requests"
    id = Column(String, primary_key=True) # request_id (8 chars uuid)
    user_email = Column(String, ForeignKey("users.email"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    model = Column(String)
    prompt = Column(Text)
    total_pages = Column(Integer)
    result_md_path = Column(String)
    metadata_json_path = Column(String)
    
    user = relationship("User", back_populates="requests")
    files = relationship("ProcessedFile", back_populates="request")
    pages = relationship("OCRPage", back_populates="request")

class ProcessedFile(Base):
    __tablename__ = "processed_files"
    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String, ForeignKey("ocr_requests.id"))
    original_name = Column(String)
    safe_name = Column(String)
    file_path = Column(String)
    saved_path = Column(String)
    file_type = Column(String)
    page_count = Column(Integer)
    
    request = relationship("OCRRequest", back_populates="files")
    pages = relationship("OCRPage", back_populates="file")

class OCRPage(Base):
    __tablename__ = "ocr_pages"
    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String, ForeignKey("ocr_requests.id"))
    file_id = Column(Integer, ForeignKey("processed_files.id"), nullable=True)
    page_no = Column(Integer)
    source_type = Column(String)
    source_file = Column(String)
    pdf_page_no = Column(Integer, nullable=True)
    text = Column(Text)
    
    request = relationship("OCRRequest", back_populates="pages")
    file = relationship("ProcessedFile", back_populates="pages")

from sqlalchemy.pool import NullPool
engine = create_engine(config.DATABASE_URL, poolclass=NullPool)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
