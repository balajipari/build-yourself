"""Add feedback table

Revision ID: 004_add_feedback
Revises: 003_add_currency_mapping
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY

# revision identifiers, used by Alembic.
revision = '004_add_feedback'
down_revision = '003_add_currency_mapping'
branch_labels = None
depends_on = None

def upgrade():
    # Create feedback table
    op.create_table(
        'feedback',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), nullable=True),  # Nullable for anonymous feedback
        sa.Column('feedback_text', sa.Text(), nullable=False),
        sa.Column('selected_tags', ARRAY(sa.String()), nullable=True),
        sa.Column('rating', sa.Float(), sa.CheckConstraint('rating >= 1 AND rating <= 5'), nullable=True),  # Store selected suggestion pills
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    )
    
    # Create index for user_id
    op.create_index('idx_feedback_user_id', 'feedback', ['user_id'])

def downgrade():
    op.drop_index('idx_feedback_user_id')
    op.drop_table('feedback')
