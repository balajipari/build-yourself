"""add credit transactions

Revision ID: 006
Revises: 005_add_credits_to_project_quota
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '006'
down_revision = '005_add_credits_to_project_quota'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create credit_transactions table with enums
    op.create_table(
        'credit_transactions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('project_id', UUID(as_uuid=True), sa.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Integer, nullable=False),
        sa.Column('type', sa.Enum('DEDUCT', 'REFUND', 'RECHARGE', name='credit_transaction_type'), nullable=False),
        sa.Column('status', sa.Enum('SUCCESS', 'FAILED', name='credit_transaction_status'), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('description', sa.String, nullable=True),  # Optional field for additional context
    )

    # Create index for faster lookups
    op.create_index('idx_credit_transactions_user_id', 'credit_transactions', ['user_id'])
    op.create_index('idx_credit_transactions_project_id', 'credit_transactions', ['project_id'])
    op.create_index('idx_credit_transactions_created_at', 'credit_transactions', ['created_at'])

def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_credit_transactions_created_at')
    op.drop_index('idx_credit_transactions_project_id')
    op.drop_index('idx_credit_transactions_user_id')

    # Drop table (this will also drop the enum types)
    op.drop_table('credit_transactions')
