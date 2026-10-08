"""Bring existing users to the current model, preserving rows and string IDs."""
from alembic import op
import sqlalchemy as sa
from app.models import Base
revision = 'b20261008'
down_revision = 'a304acb31b72'
branch_labels = depends_on = None
def upgrade():
    bind = op.get_bind()
    # This archive originally creates VARCHAR ids. Refuse silently destructive conversion of other databases.
    for table in ['users', 'products']:
        columns = {c['name']: c for c in sa.inspect(bind).get_columns(table, schema='catalog')}
        if not isinstance(columns['id']['type'], sa.String):
            raise RuntimeError("Expected string IDs from the original project; back up and review this database before migrating")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS email VARCHAR(255)")
    op.execute("UPDATE catalog.users SET email = 'legacy-' || id || '@accounts.invalid' WHERE email IS NULL OR btrim(email) = ''")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN email SET NOT NULL")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN password TYPE VARCHAR(255)")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN username TYPE VARCHAR(100)")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN name TYPE VARCHAR(255)")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN role TYPE VARCHAR(50)")
    op.execute("UPDATE catalog.users SET role = 'user' WHERE role IS NULL")
    op.execute("ALTER TABLE catalog.users ALTER COLUMN role SET NOT NULL")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()")
    op.execute("ALTER TABLE catalog.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_catalog_users_email ON catalog.users(email)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_catalog_users_username ON catalog.users(username)")
    op.execute("ALTER TABLE catalog.products ALTER COLUMN country DROP NOT NULL")
    Base.metadata.create_all(bind)
def downgrade():
    raise RuntimeError("Destructive downgrade is disabled; restore a backup if needed")
