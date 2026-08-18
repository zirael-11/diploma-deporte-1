import React from 'react';

function Cart({ cartItems = [], setCartItems }) {
  // 1. Функция изменения количества товара (+1 / -1)
  const updateQuantity = (id, size, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, quantity: Math.max(1, item.quantity + amount) }
            : item
        )
    );
  };

  // 2. Функция полного удаления позиции из корзины
  const removeItem = (id, size) => {
    setCartItems((prevItems) => prevItems.filter((item) => !(item.id === id && item.size === size)));
  };

  // 3. Вычисление математических итогов
  const totalPrice = cartItems.reduce((sum, item) => sum + item.priceNum * item.quantity, 0);

  // Если корзина пуста — выводим аккуратную спортивную заглушку
  if (cartItems.length === 0) {
    return (
      <div className="catalog-page-container" style={{ textAlign: 'center', padding: '150px 20px' }}>
        <h2 className="catalog-main-title">ВАША КОРЗИНА ПУСТА</h2>
        <p style={{ opacity: 0.5, marginTop: '10px' }}>Вы пока не добавили ни одного комплекта экипировки.</p>
      </div>
    );
  }

  return (
    <div className="catalog-page-container" style={{ padding: '120px 40px' }}>
      <div className="catalog-header-section" style={{ marginBottom: '40px' }}>
        <h2 className="catalog-main-title">КОРЗИНА ТОВАРОВ</h2>
        <p className="catalog-subtitle">Проверьте выбранную экипировку и перейдите к оформлению заказа</p>
      </div>

      <div className="cart-page-layout" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: Список интерактивных карточек */}
        <div className="cart-items-list-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.map((item, idx) => (
            <div key={`${item.id}-${item.size}-${idx}`} className="product-item-card" style={{ display: 'flex', flexDirection: 'row', padding: '20px', alignItems: 'center', gap: '25px', minHeight: 'auto' }}>
              <div className="product-card-image-wrapper" style={{ width: '100px', height: '100px', minWidth: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '10px' }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="product-card-category-tag" style={{ margin: 0 }}>Размер: <strong style={{ color: '#2ecc71' }}>{item.size}</strong></span>
                <h4 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>{item.title}</h4>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#2ecc71', marginTop: '6px' }}>{item.price}</span>
              </div>

              {/* УПРАВЛЕНИЕ КОЛИЧЕСТВОМ ТОВАРОВ */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                <button onClick={() => updateQuantity(item.id, item.size, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '900', fontSize: '16px' }}>−</button>
                <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.size, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: '900', fontSize: '16px' }}>+</button>
              </div>

              {/* КНОПКА КРЕСТИКА ДЛЯ УДАЛЕНИЯ */}
              <button 
                onClick={() => removeItem(item.id, item.size)} 
                style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '20px', cursor: 'pointer', padding: '0 10px', opacity: 0.7 }}
                title="Удалить из корзины"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Итоговый чек и оформление */}
        <div className="catalog-sidebar-filters" style={{ width: '340px', minWidth: '340px', position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '900', margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>ИТОГО К ОПЛАТЕ</h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.7 }}>
            <span>Позиций в заказе:</span>
            <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', opacity: 0.7 }}>
            <span>Доставка:</span>
            <strong style={{ color: '#2ecc71' }}>Бесплатно</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '15px', marginTop: '5px' }}>
            <span style={{ fontSize: '15px', fontWeight: '700' }}>Общая сумма:</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#2ecc71' }}>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>

          <button 
            className="modal-action-buy-btn" 
            onClick={() => { alert('Заказ успешно сформирован! Наш менеджер свяжется с вами.'); setCartItems([]); }}
            style={{ marginTop: '10px', padding: '16px' }}
          >
            ОФОРМИТЬ ЗАКАЗ
          </button>
        </div>

      </div>
    </div>
  );
}

export default Cart;