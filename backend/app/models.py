"""
SQLAlchemy models for the Build Yourself API
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB, ENUM
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

Base = declarative_base()


# Status enums
class UserStatus(enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"


class ProjectStatus(enum.Enum):
    DRAFT = "DRAFT"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    status = Column(ENUM(UserStatus, name="user_status"), default=UserStatus.ACTIVE, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    
    # Relationships
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    project_quota = relationship("ProjectQuota", back_populates="user", uselist=False)


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    project_type = Column(String(50), nullable=False)  # 'bike', 'car', etc.
    status = Column(ENUM(ProjectStatus, name="project_status"), default=ProjectStatus.DRAFT, nullable=True)
    configuration = Column(JSONB, nullable=True)
    image_base64 = Column(Text, nullable=True)  # Store generated image as base64
    conversation_history = Column(JSONB, nullable=True)  # Store chat conversation history
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="projects")
    favorites = relationship("UserFavorite", back_populates="project", cascade="all, delete-orphan")


class UserFavorite(Base):
    __tablename__ = "user_favorites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="favorites")
    project = relationship("Project", back_populates="favorites")
    
    # Ensure unique user-project combination
    __table_args__ = (UniqueConstraint('user_id', 'project_id', name='uq_user_project_favorite'),)


class ProjectQuota(Base):
    __tablename__ = "project_quotas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    completed_projects_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="project_quota")

    @property
    def free_projects_remaining(self) -> int:
        """Calculate remaining free projects"""
        MAX_FREE_PROJECTS = 2
        return max(0, MAX_FREE_PROJECTS - self.completed_projects_count)

    @property
    def has_free_projects(self) -> bool:
        """Check if user has any free projects remaining"""
        return self.free_projects_remaining > 0