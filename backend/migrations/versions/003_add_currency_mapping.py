"""add currency mapping

Revision ID: 003_add_currency_mapping
Revises: 002
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '003_add_currency_mapping'
down_revision = '002'
branch_labels = None
depends_on = None

def upgrade():
    # Create currency table
    op.create_table(
        'currencies',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('code', sa.String(3), nullable=False, unique=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('symbol', sa.String(5), nullable=False),
        sa.Column('rate_to_usd', sa.Float, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False)
    )

    # Create credit packages table
    op.create_table(
        'credit_packages',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('credits', sa.Integer, nullable=False),
        sa.Column('base_price_usd', sa.Float, nullable=False),  # Price in USD
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()'), nullable=False)
    )

    # Insert default currencies
    op.execute("""
        INSERT INTO currencies (code, name, symbol, rate_to_usd) VALUES
        ('USD', 'US Dollar', '$', 1.0),
        ('INR', 'Indian Rupee', '₹', 0.012);  -- 1 USD = ~83 INR
    """)

    # Insert default credit packages
    op.execute("""
        INSERT INTO credit_packages (credits, base_price_usd) VALUES
        (5, 1.25),    -- $0.25 per credit
        (10, 2.50),
        (20, 5.0),
        (50, 12.5);
    """)

def downgrade():
    op.drop_table('credit_packages')
    op.drop_table('currencies')
