"""
SQLAlchemy models for the Build Yourself API
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
Base = declarative_base()


# Status constants as dictionaries
USER_STATUS = {
    "ACTIVE": "active",
    "INACTIVE": "inactive", 
    "SUSPENDED": "suspended"
}

PROJECT_STATUS = {
    "DRAFT": "draft",
    "IN_PROGRESS": "in_progress",
    "COMPLETED": "completed",
    "ARCHIVED": "archived"
}


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), nullable=False)  # 'bike', 'car', etc.
    status = Column(String(20), default="draft")
    configuration = Column(JSONB, nullable=True)
    image_base64 = Column(Text, nullable=True)  # Store generated image as base64
    conversation_history = Column(JSONB, nullable=True)  # Store chat conversation history
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="projects")
    favorites = relationship("UserFavorite", back_populates="project", cascade="all, delete-orphan")





class UserFavorite(Base):
    __tablename__ = "user_favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    project = relationship("Project", back_populates="favorites")
    
    # Ensure unique user-project combination
    __table_args__ = (UniqueConstraint('user_id', 'project_id', name='uq_user_project_favorite'),)
