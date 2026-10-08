import { useShopTranslation } from '../i18n/useShopTranslation';
import { imageUrl } from '../api';
import React, { useState } from 'react';

function Favorites({ favorites = [], toggleFavorite, addToCart }) {
  const { t, productText, formatMoney } = useShopTranslation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSize, setModalSize] = useState('M');
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  if (favorites.length === 0) {
    return (
      <div className="catalog-page-container" style={{ textAlign: 'center', padding: '150px 20px' }}>
        <h2 className="catalog-main-title">{t("ВАШИ ЗАКЛАДКИ ПУСТЫ")}</h2>
        <p style={{ opacity: 0.5, marginTop: '10px' }}>{t("Вы пока не отложили ни одного комплекта экипировки.")}</p>
      </div>
    );
  }

  return (
    <div className="catalog-page-container" style={{ padding: '120px 40px' }}>
      <div className="catalog-header-section" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 className="catalog-main-title">{t("ВАШИ ЗАКЛАДКИ (")}{favorites.length})</h2>
        <p className="catalog-subtitle">{t("Товары, которые вы отложили для дальнейших покупок")}</p>
      </div>

      <div className="products-grid-container grid-4-columns">
        {favorites.map((product) => (
          <div
            key={product.id}
            className="product-item-card"
            onClick={() => setSelectedProduct(product)}
            style={{ cursor: 'pointer' }}
          >
            <div className="product-card-image-wrapper">
              {product.badge && <span className="product-card-badge">{product.badge}</span>}

              <button
                className="admin-delete-product-btn"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                title={t("Удалить из закладок")}
              >
                ✕
              </button>

              {/* ИСПРАВЛЕНО: Безопасный рендеринг картинок и ховера, фото больше не пропадает при наведении */}
                <img
                  src={imageUrl(product.image)}
                  className="product-item-img"
                  alt={productText(product, 'title')}
                  onMouseEnter={(e) => e.currentTarget.src = imageUrl(product.image_hover || product.imageHover || product.image)}
                  onMouseLeave={(e) => e.currentTarget.src = imageUrl(product.image)}
                />
            </div>

            <div className="product-card-info-content">
              <span className="product-card-category-tag">
                {t(product.main_category || product.mainCategory || '')} {product.club ? `› ${t(product.club)}` : product.country ? `› ${t(product.country || '')}` : ''}
              </span>
              <h4 className="product-card-item-title">{productText(product, 'title')}</h4>
              <div className="product-card-price-row">
                <span className="product-card-current-price">{formatMoney(product.price_num ?? product.priceNum)}</span>
                {product.oldPrice && <span className="product-card-old-price">{product.oldPrice}</span>}
              </div>

              <button
                className="product-card-buy-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if(addToCart) { addToCart(product, 'M'); }
                }}
              >
                {t("В КОРЗИНУ")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДЛЯ СТРАНИЦЫ ИЗБРАННОГО */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-info-modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            <div className="modal-product-layout">
              <div className="modal-product-media">
                <img src={imageUrl(selectedProduct.image)} alt={productText(selectedProduct, 'title')} className="modal-main-img" />
              </div>
              <div className="modal-product-details">
                <div>
                  {/* Название и категория товара */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span className="modal-category-tag" style={{ display: 'block', textAlign: 'left' }}>{t(selectedProduct.main_category || selectedProduct.mainCategory || '')}</span>
                    <h3 className="modal-product-title" style={{ textAlign: 'left', margin: '4px 0 12px 0' }}>{productText(selectedProduct, 'title')}</h3>
                  </div>

                  {/* ИСПРАВЛЕНО: Кнопка-сердечко сдвинута к цене*/}
                  <div className="modal-price-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="modal-current-price">{formatMoney(selectedProduct.price_num ?? selectedProduct.priceNum)}</span>
                      {selectedProduct.oldPrice && <span className="modal-old-price" style={{marginLeft:'15px', opacity:0.35, textDecoration:'line-through'}}>{selectedProduct.oldPrice}</span>}
                    </div>

                    <button
                      className="modal-fav-inline-btn active"
                      onClick={() => { toggleFavorite(selectedProduct); setSelectedProduct(null); }}
                      style={{ position: 'relative', top: '0', right: '0', margin: 0 }}
                    >
                      ❤
                    </button>
                  </div>

                  {/* Описание модели (ИСПРАВЛЕНО: Дубликат цены полностью удален) */}
                  <div className="modal-description-block">
                    <h5>{t("ОПИСАНИЕ МОДЕЛИ")}</h5>
                    <p>{productText(selectedProduct, 'description')}</p>
                    <ul>
                      <li><strong>{t("Тип экипировки:")}</strong> {t(selectedProduct.type || 'Игровая форма')}</li>
                      <li><strong>{t("Год выпуска:")}</strong> {t("Сезон")} {selectedProduct.year || '2026'}</li>
                    </ul>
                  </div>

                  <div className="modal-size-selector-block">
                    <h5>{t("ВЫБЕРИТЕ РАЗМЕР:")}</h5>
                    <div className="modal-sizes-grid">
                      {sizesList.map(sz => (
                        <button key={sz} className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`} onClick={() => setModalSize(sz)}>{sz}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  className="modal-action-buy-btn"
                  onClick={() => {
                    if(addToCart) { addToCart(selectedProduct, modalSize); }
                    setSelectedProduct(null);
                  }}
                >
                  {t("ДОБАВИТЬ В КОРЗИНУ")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Favorites;
