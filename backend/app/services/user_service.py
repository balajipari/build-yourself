"""
User service layer for business logic
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_
from uuid import UUID
from ..models import User, UserStatus
from ..schemas import UserCreate, UserUpdate, UserResponse


class UserService:
    """Service class for user operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google OAuth ID"""
        return self.db.query(User).filter(User.google_id == google_id).first()
    
    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        try:
            user = User(
                email=user_data.email,
                username=user_data.username,
                full_name=user_data.full_name,
                avatar_url=user_data.avatar_url,
                google_id=user_data.google_id,
                status=UserStatus.ACTIVE
            )
            
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            return user
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create user: {str(e)}")
    
    def create_or_get_user(self, user_data: UserCreate) -> User:
        """
        Create a new user if they don't exist, otherwise return existing user
        This is used during OAuth signin
        """
        try:
            # First try to find by Google ID if available
            if user_data.google_id:
                existing_user = self.get_user_by_google_id(user_data.google_id)
                if existing_user:
                    return existing_user
            
            # Then try to find by email
            existing_user = self.get_user_by_email(user_data.email)
            if existing_user:
                # Update Google ID if not set
                if user_data.google_id and not existing_user.google_id:
                    existing_user.google_id = user_data.google_id
                    self.db.commit()
                    self.db.refresh(existing_user)
                return existing_user
            
            # Create new user if not found
            return self.create_user(user_data)
            
        except Exception as e:
            raise Exception(f"Failed to create or get user: {str(e)}")
    
    def update_user(self, user_id: UUID, user_data: UserUpdate) -> Optional[User]:
        """Update an existing user"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # Update only provided fields
            update_data = user_data.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(user, field, value)
            
            self.db.commit()
            self.db.refresh(user)
            
            return user
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update user: {str(e)}")
    
    def deactivate_user(self, user_id: UUID) -> bool:
        """Deactivate a user (soft delete)"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            user.status = UserStatus.INACTIVE
            self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to deactivate user: {str(e)}")
    
    def get_user_profile(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        """Get user profile with basic stats"""
        try:
            user = self.get_user_by_id(user_id)
            if not user:
                return None
            
            # Basic user info
            profile = {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
                "full_name": user.full_name,
                "avatar_url": user.avatar_url,
                "status": user.status.value,
                "created_at": user.created_at.isoformat(),
                "updated_at": user.updated_at.isoformat()
            }
            
            return profile
            
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")
    
    def search_users(self, search_term: str, limit: int = 10) -> list[User]:
        """Search users by name, username, or email"""
        try:
            search_pattern = f"%{search_term}%"
            users = self.db.query(User).filter(
                and_(
                    User.status == UserStatus.ACTIVE,
                    (
                        User.full_name.ilike(search_pattern) |
                        User.username.ilike(search_pattern) |
                        User.email.ilike(search_pattern)
                    )
                )
            ).limit(limit).all()
            
            return users
        except Exception as e:
            raise Exception(f"Failed to search users: {str(e)}")
