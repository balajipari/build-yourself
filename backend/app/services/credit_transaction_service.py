from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from ..models import CreditTransaction, ProjectQuota, User, Project
from ..models import CreditTransactionType, CreditTransactionStatus

class CreditTransactionService:
    def __init__(self, db: Session):
        self.db = db

    def deduct_credits(
        self,
        user: User,
        project: Project,
        amount: int,
        description: Optional[str] = None
    ) -> CreditTransaction:
        """
        Deduct credits from user's quota and create a transaction record
        """
        # Get user's project quota
        quota = self.db.query(ProjectQuota).filter(ProjectQuota.user_id == user.id).first()
        if not quota:
            raise ValueError("User has no project quota")

        # Check if user has enough credits
        if quota.credits < amount:
            raise ValueError("Insufficient credits")

        # Deduct credits
        quota.credits -= amount

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user.id,
            project_id=project.id,
            amount=amount,
            type=CreditTransactionType.DEDUCT,
            status=CreditTransactionStatus.SUCCESS,
            description=description
        )
        self.db.add(transaction)
        self.db.commit()

        return transaction

    def refund_credits(
        self,
        user: User,
        project: Project,
        amount: int,
        description: Optional[str] = None
    ) -> CreditTransaction:
        """
        Refund credits to user's quota and create a transaction record
        """
        # Get user's project quota
        quota = self.db.query(ProjectQuota).filter(ProjectQuota.user_id == user.id).first()
        if not quota:
            raise ValueError("User has no project quota")

        # Add credits back
        quota.credits += amount

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user.id,
            project_id=project.id,
            amount=amount,
            type=CreditTransactionType.REFUND,
            status=CreditTransactionStatus.SUCCESS,
            description=description
        )
        self.db.add(transaction)
        self.db.commit()

        return transaction

    def create_recharge_transaction(
        self,
        user_id: UUID,
        project_id: UUID,
        amount: int,
        description: Optional[str] = None
    ) -> CreditTransaction:
        """
        Create a transaction record for credit recharge and update project quota
        """
        # Get user's project quota
        quota = self.db.query(ProjectQuota).filter(ProjectQuota.user_id == user_id).first()
        if not quota:
            raise ValueError("User has no project quota")

        # Add credits to quota
        quota.credits += amount

        # Create transaction record
        transaction = CreditTransaction(
            user_id=user_id,
            project_id=project_id,
            amount=amount,
            type=CreditTransactionType.RECHARGE,
            status=CreditTransactionStatus.SUCCESS,
            description=description
        )
        self.db.add(transaction)
        self.db.commit()

        return transaction
