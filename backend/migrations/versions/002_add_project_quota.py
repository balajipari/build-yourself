"""Add project quota table

Revision ID: 002
Revises: 001
Create Date: 2024-01-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create project_quotas table
    op.create_table('project_quotas',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('completed_projects_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('idx_project_quotas_user_id', 'project_quotas', ['user_id'], unique=True)
    
    # Add trigger for updated_at
    op.execute("""
        CREATE TRIGGER update_project_quotas_updated_at BEFORE UPDATE ON project_quotas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)

    # Create quotas for existing users
    op.execute("""
        INSERT INTO project_quotas (user_id, completed_projects_count)
        SELECT id, (
            SELECT COUNT(*)
            FROM projects p
            WHERE p.user_id = users.id
            AND p.status = 'COMPLETED'
        )
        FROM users
        ON CONFLICT (user_id) DO NOTHING;
    """)


def downgrade() -> None:
    # Drop trigger
    op.execute('DROP TRIGGER IF EXISTS update_project_quotas_updated_at ON project_quotas')
    
    # Drop table
    op.drop_table('project_quotas')
