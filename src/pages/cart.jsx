import React from 'react';

function Cart({ cartItems = [], setCartItems, setSelectedProduct }) {
  // Функция для удаления конкретного элемента из корзины
  const handleRemoveItem = (idxToRemove, e) => {
    e.stopPropagation(); // Чтобы клик не открывал модальное окно
    setCartItems(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  // Функция изменения количества товара (+ / -)
  const handleUpdateQuantity = (idxToUpdate, delta, e) => {
    e.stopPropagation(); // Чтобы клик не открывал модальное окно
    setCartItems(prev => prev.map((item, idx) => {
      if (idx === idxToUpdate) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    }));
  };

  // Считаем общую стоимость и количество позиций
  const totalPositions = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalPriceNum = cartItems.reduce((acc, item) => acc + ((item.price_num || item.priceNum || 0) * (item.quantity || 1)), 0);
  const totalPriceStr = `${totalPriceNum.toLocaleString('ru-RU')} ₽`;

  return (
    <div className="catalog-page-container" style={{ padding: '120px 40px' }}>
      <div className="catalog-header-section" style={{ marginBottom: '40px' }}>
        <h2 className="catalog-main-title">КОРЗИНА ТОВАРОВ</h2>
        <p className="catalog-subtitle">Проверьте выбранную экипировку и перейдите к оформлению заказа</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart-message" style={{ textAlign: 'center', padding: '60px 0', opacity: 0.5 }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>🛒</span>
          <h3>Ваша корзина пуста,чувак</h3>
          <p>Перейдите в каталог, чтобы добавить спортивные товары сюды.</p>
        </div>
      ) : (
        <div className="cart-page-layout" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          
          {/* ЛЕВАЯ ЧАСТЬ: Список интерактивных карточек */}
          <div className="cart-items-list-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cartItems.map((item, idx) => {
              const qty = item.quantity || 1;
              return (
                <div 
                  key={`${item.id}-${item.size}-${idx}`} 
                  className="product-item-card" 
                  onClick={() => setSelectedProduct && setSelectedProduct(item)} // Открываем модальное окно при клике
                  style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '15px', position: 'relative', cursor: 'pointer', alignItems: 'center', gap: '20px' }}
                >
                  {/* Кнопка быстрого удаления (крестик) */}
                  <button 
                    onClick={(e) => handleRemoveItem(idx, e)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-main)', opacity: 0.3, cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                  >
                    ✕
                  </button>

                  {/* Картинка товара */}
                  <div className="product-card-image-wrapper" style={{ width: '100px', height: '100px', minWidth: '100px', backgroundColor: '#111', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={`/src/assets/images/${item.image}`} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      onError={(e) => { e.currentTarget.src = '/src/assets/images/spainfuria2026.png'; }} // ИСПРАВЛЕНО: Защита от отсутствующих файлов
                    />
                  </div>

                  {/* Информация о товаре */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="product-card-category-tag" style={{ margin: 0, fontSize: '12px', opacity: 0.5 }}>РАЗМЕР: {item.size || 'M'}</span>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{item.title}</h4>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#2ecc71', marginTop: '6px' }}>{item.price_str || item.price}</span>
                  </div>

                  {/* Блок изменения количества */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#111', padding: '6px 12px', borderRadius: '6px' }}>
                    <button onClick={(e) => handleUpdateQuantity(idx, -1, e)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>-</button>
                    <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', minWidth: '15px', textAlign: 'center' }}>{qty}</span>
                    <button onClick={(e) => handleUpdateQuantity(idx, 1, e)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Итоговый чек покупки */}
          <div className="cart-total-summary-card" style={{ width: '360px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>ИТОГО К ОПЛАТЕ</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.7 }}>
                <span>Позиций в заказе:</span>
                <strong>{totalPositions} шт.</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.7 }}>
                <span>Доставка:</span>
                <strong style={{ color: '#2ecc71' }}>Бесплатно</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Общая сумма:</span>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#2ecc71' }}>{totalPriceStr}</span>
            </div>

            <button className="modal-action-buy-btn" style={{ width: '100%', padding: '16px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', marginTop: '10px' }}>
              ОФОРМИТЬ ЗАКАЗ
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;