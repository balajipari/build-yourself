"""
SQLAlchemy models for the Build Yourself API
"""

from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, ForeignKey, Enum, UniqueConstraint, Integer, Float, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB, ENUM
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
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
    feedback = relationship("Feedback", back_populates="user", lazy="dynamic")


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

    @property
    def is_favorite(self) -> bool:
        """Check if project has any favorites"""
        return bool(self.favorites)


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
    credits = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="project_quota")

    @property
    def free_projects_remaining(self) -> int:
        """Calculate remaining free projects"""
        MAX_FREE_PROJECTS = 2
        free_remaining = max(0, MAX_FREE_PROJECTS - self.completed_projects_count)
        return free_remaining + self.credits

    @property
    def has_free_projects(self) -> bool:
        """Check if user has any free projects remaining"""
        return self.free_projects_remaining > 0

    def add_credits(self, amount: int) -> None:
        """Add credits to the user's quota"""
        self.credits += amount


class Currency(Base):
    __tablename__ = "currencies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    code = Column(String(3), unique=True, nullable=False)  # e.g., USD, INR
    name = Column(String(50), nullable=False)  # e.g., US Dollar, Indian Rupee
    symbol = Column(String(5), nullable=False)  # e.g., $, ₹
    rate_to_usd = Column(Float, nullable=False)  # Exchange rate to USD
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def convert_from_usd(self, usd_amount: float) -> float:
        """Convert USD amount to this currency"""
        return round(usd_amount / self.rate_to_usd, 2)

    def convert_to_usd(self, amount: float) -> float:
        """Convert amount in this currency to USD"""
        return round(amount * self.rate_to_usd, 2)


class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    feedback_text = Column(Text, nullable=False)
    selected_tags = Column(ARRAY(String), nullable=True)
    rating = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship
    user = relationship("User", back_populates="feedback")

    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='ck_feedback_rating_range'),
    )


class CreditPackage(Base):
    __tablename__ = "credit_packages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.uuid_generate_v4())
    credits = Column(Integer, nullable=False)
    base_price_usd = Column(Float, nullable=False)  # Price in USD
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def get_price_in_currency(self, currency: Currency) -> float:
        """Get package price in specified currency"""
        return currency.convert_from_usd(self.base_price_usd)