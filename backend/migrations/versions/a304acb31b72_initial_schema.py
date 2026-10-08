"""Create missing catalog tables without replacing existing data."""
from alembic import op
from app.models import Base
revision = 'a304acb31b72'
down_revision = None
branch_labels = depends_on = None
def upgrade():
    op.execute("CREATE SCHEMA IF NOT EXISTS catalog")
    # Users/products first; dependent tables follow in the next revision.
    Base.metadata.create_all(op.get_bind(), tables=[Base.metadata.tables['catalog.users'], Base.metadata.tables['catalog.products']])
def downgrade():
    raise RuntimeError("Destructive downgrade is disabled; restore a backup if needed")
