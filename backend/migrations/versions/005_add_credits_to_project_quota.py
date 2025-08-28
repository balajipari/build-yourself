"""Add credits to project quota

Revision ID: 005_add_credits_to_project_quota
Revises: 004_add_feedback
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '005_add_credits_to_project_quota'
down_revision = '004_add_feedback'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add credits column with default value 0
    op.add_column('project_quotas',
        sa.Column('credits', sa.Integer(), nullable=False, server_default='0')
    )


def downgrade() -> None:
    # Remove credits column
    op.drop_column('project_quotas', 'credits')
