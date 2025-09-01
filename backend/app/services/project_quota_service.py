"""
Service for managing project quotas
"""

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from ..models import ProjectQuota, Project
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

    def increment_completed_projects(self, user_id: UUID, project_id: UUID = None) -> ProjectQuota:
        """Increment completed projects count and log credit deduction if applicable"""
        try:
            quota = self.get_user_quota(user_id)
            
            # First use credits if available
            if quota.credits > 0:
                # Get project for transaction record
                if not project_id:
                    project = self.db.query(Project).filter(Project.user_id == user_id).first()
                    project_id = project.id if project else None

                if project_id:
                    # Create deduction transaction (this will also update the quota)
                    from .credit_transaction_service import CreditTransactionService
                    credit_service = CreditTransactionService(self.db)
                    credit_service.deduct_credits(
                        user=quota.user,
                        project=self.db.query(Project).get(project_id),
                        amount=1,
                        description="Project completion credit deduction"
                    )
                else:
                    # If no project_id available, just update quota
                    quota.credits -= 1
            else:
                # If no credits, increment completed projects count
                quota.completed_projects_count += 1
                
            self.db.commit()
            self.db.refresh(quota)
            return quota
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to increment completed projects: {str(e)}")

    def can_create_project(self, user_id: UUID) -> bool:
        """Check if user can create a new project"""
        quota = self.get_user_quota(user_id)
        return quota.has_free_projects

    def add_credits(self, user_id: UUID, amount: int, package_id: UUID = None, description: str = None) -> ProjectQuota:
        """Add credits to user's quota and log the transaction"""
        try:
            # Get the first project (or None) for the user to link the transaction
            # This is needed as our transaction table requires a project_id
            project = self.db.query(Project).filter(Project.user_id == user_id).first()
            
            # Use provided description or create default one
            if description is None:
                description = f"Recharged {amount} credits"
                if package_id:
                    description += f" (Package ID: {package_id})"

            if project:
                # Create recharge transaction (this will also update the quota)
                from .credit_transaction_service import CreditTransactionService
                credit_service = CreditTransactionService(self.db)
                credit_service.create_recharge_transaction(
                    user_id=user_id,
                    project_id=project.id,
                    amount=amount,
                    description=description
                )
            else:
                # If no project exists yet, just update the quota directly
                quota = self.get_user_quota(user_id)
                quota.add_credits(amount)
                self.db.commit()
                self.db.refresh(quota)

            return self.get_user_quota(user_id)
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to add credits: {str(e)}")
