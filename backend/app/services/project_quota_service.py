"""
Service for managing project quotas
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from ..models import ProjectQuota
from ..schemas import ProjectQuotaCreate

class ProjectQuotaService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_quota(self, user_id: UUID) -> ProjectQuota:
        """Get or create user's project quota"""
        quota = self.db.query(ProjectQuota).filter(ProjectQuota.user_id == user_id).first()
        if not quota:
            quota = ProjectQuota(user_id=user_id, completed_projects_count=0)
            self.db.add(quota)
            try:
                self.db.commit()
                self.db.refresh(quota)
            except IntegrityError:
                self.db.rollback()
                # In case of race condition, try to get again
                quota = self.db.query(ProjectQuota).filter(ProjectQuota.user_id == user_id).first()
        
        return quota

    def increment_completed_projects(self, user_id: UUID) -> ProjectQuota:
        """Increment completed projects count"""
        quota = self.get_user_quota(user_id)
        
        # First use credits if available
        if quota.credits > 0:
            quota.credits -= 1
        else:
            # If no credits, increment completed projects count
            quota.completed_projects_count += 1
            
        self.db.commit()
        self.db.refresh(quota)
        return quota

    def can_create_project(self, user_id: UUID) -> bool:
        """Check if user can create a new project"""
        quota = self.get_user_quota(user_id)
        return quota.has_free_projects

    def add_credits(self, user_id: UUID, amount: int) -> ProjectQuota:
        """Add credits to user's quota"""
        quota = self.get_user_quota(user_id)
        quota.add_credits(amount)
        self.db.commit()
        self.db.refresh(quota)
        return quota
