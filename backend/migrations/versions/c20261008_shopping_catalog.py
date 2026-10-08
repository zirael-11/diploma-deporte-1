"""Persistent favorites/cart and a real catalog of at least 120 products."""
from alembic import op
import sqlalchemy as sa
from app.models import Base
from app.catalog_seed import fill_catalog
revision='c20261008'
down_revision='b20261008'
branch_labels=depends_on=None
def upgrade():
    bind=op.get_bind()
    # Existing duplicate cart rows are combined before adding uniqueness.
    op.execute("""UPDATE catalog.cart_items a SET quantity = b.total FROM
        (SELECT user_id, product_id, selected_size, min(id) AS keep_id, sum(quantity) AS total
         FROM catalog.cart_items GROUP BY user_id, product_id, selected_size) b
        WHERE a.id = b.keep_id""")
    op.execute("""DELETE FROM catalog.cart_items a USING catalog.cart_items b
        WHERE a.user_id=b.user_id AND a.product_id=b.product_id AND a.selected_size=b.selected_size AND a.id>b.id""")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_cart_user_product_size ON catalog.cart_items(user_id, product_id, selected_size)")
    Base.metadata.create_all(bind, tables=[Base.metadata.tables['catalog.favorites']])
    fill_catalog(bind)
def downgrade():
    raise RuntimeError("Destructive downgrade is disabled; use a backup")
