from sqlalchemy import Column, Enum, ForeignKey, Integer, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from ..models import Base

class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Integer, nullable=False)
    type = Column(Enum("DEDUCT", "REFUND", name="credit_transaction_type"), nullable=False)
    status = Column(Enum("SUCCESS", "FAILED", name="credit_transaction_status"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"), nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="credit_transactions")
    project = relationship("Project", back_populates="credit_transactions")
