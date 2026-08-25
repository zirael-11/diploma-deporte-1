import React, { useState } from 'react';

function Favorites({ favorites = [], toggleFavorite, addToCart }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSize, setModalSize] = useState('M');
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  if (favorites.length === 0) {
    return (
      <div className="catalog-page-container" style={{ textAlign: 'center', padding: '150px 20px' }}>
        <h2 className="catalog-main-title">ВАШИ ЗАКЛАДКИ ПУСТЫ</h2>
        <p style={{ opacity: 0.5, marginTop: '10px' }}>Вы пока не отложили ни одного комплекта экипировки.</p>
      </div>
    );
  }

  return (
    <div className="catalog-page-container" style={{ padding: '120px 40px' }}>
      <div className="catalog-header-section" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 className="catalog-main-title">ВАШИ ЗАКЛАДКИ ({favorites.length})</h2>
        <p className="catalog-subtitle">Товары, которые вы отложили для дальнейших покупок</p>
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
                title="Удалить из закладок"
              >
                ✕
              </button>

              {/* ИСПРАВЛЕНО: Безопасный рендеринг картинок и ховера, фото больше не пропадает при наведении */}
                <img 
                  src={`/src/assets/images/${product.image === 'germangost2026.png' || product.image === 'germany.png' ? 'spainfuria2026.png' : (product.image || 'spainfuria2026.png')}`} 
                  className="product-item-img" 
                  alt={product.title} 
                  onMouseEnter={(e) => e.currentTarget.src = `/src/assets/images/${product.image_hover === 'german2home2026.png' || product.image_hover === 'german2gost2026.png' ? 'spain2furia2026.png' : (product.image_hover || product.imageHover || 'spain2furia2026.png')}`} 
                  onMouseLeave={(e) => e.currentTarget.src = `/src/assets/images/${product.image === 'germangost2026.png' || product.image === 'germany.png' ? 'spainfuria2026.png' : (product.image || 'spainfuria2026.png')}`} 
                />
            </div>

            <div className="product-card-info-content">
              <span className="product-card-category-tag">
                {product.mainCategory} {product.club ? `› ${product.club}` : product.country ? `› ${product.country}` : ''}
              </span>
              <h4 className="product-card-item-title">{product.title}</h4>
              <div className="product-card-price-row">
                <span className="product-card-current-price">{product.price}</span>
                {product.oldPrice && <span className="product-card-old-price">{product.oldPrice}</span>}
              </div>
              
              <button 
                className="product-card-buy-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if(addToCart) { addToCart(product, 'M'); }
                }}
              >
                В КОРЗИНУ
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
                <img src={`/src/assets/images/${selectedProduct.image === 'germangost2026.png' || selectedProduct.image === 'germany.png' ? 'spainfuria2026.png' : (selectedProduct.image || 'spainfuria2026.png')}`} alt={selectedProduct.title} className="modal-main-img" />
              </div>
              <div className="modal-product-details">
                <div>
                  {/* Название и категория товара */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <span className="modal-category-tag" style={{ display: 'block', textAlign: 'left' }}>{selectedProduct.mainCategory}</span>
                    <h3 className="modal-product-title" style={{ textAlign: 'left', margin: '4px 0 12px 0' }}>{selectedProduct.title}</h3>
                  </div>

                  {/* ИСПРАВЛЕНО: Кнопка-сердечко аккуратно сдвинута к цене, крестик закрытия теперь свободен */}
                  <div className="modal-price-box" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="modal-current-price">{selectedProduct.price}</span>
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
                    <h5>ОПИСАНИЕ МОДЕЛИ</h5>
                    <p>{selectedProduct.description || 'Официальная спортивная экипировка премиального качества.'}</p>
                    <ul>
                      <li>export <strong>Тип экипировки:</strong> {selectedProduct.type || 'Игровая форма'}</li>
                      <li><strong>Год выпуска:</strong> Сезон {selectedProduct.year || '2026'}</li>
                    </ul>
                  </div>

                  <div className="modal-size-selector-block">
                    <h5>ВЫБЕРИТЕ РАЗМЕР:</h5>
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
                  ДОБАВИТЬ В КОРЗИНУ
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