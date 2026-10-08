import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Checkout({ cartItems = [], clearCart, currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  // Состояния формы доставки
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');
  const [credentials, setCredentials] = useState(null);

  // Автозаполнение, если пользователь УЖЕ залогинен через Redis сессию
  useEffect(() => {
    if (currentUser?.id) {
      setFullName(currentUser.name);
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const priceNum = Number(item.price_num ?? item.priceNum ?? 0);
      return total + (priceNum * (item.quantity || 1));
    }, 0);
  };

  const handleSubmitOrder = async e => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) return alert('Заполните данные доставки');
    if (!cartItems.length) return alert('Корзина пуста');
    setLoading(true);
    try {
      const order = await api(currentUser.id ? '/orders' : '/orders/guest', { method: 'POST', body: JSON.stringify({
        full_name: fullName, phone, address,
        ...(!currentUser.id ? { email, password: accountPassword || null } : {}),
        items: cartItems.map(item => ({ product_id: String(item.id), quantity: item.quantity || 1, size: item.size || 'M' })),
      }) });
      setOrderNumber(order.number);
      setIsSubmitted(true);
      clearCart();
      if (order.user) { setCredentials(order.credentials); setCurrentUser(order.user); }
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  if (isSubmitted) {
    return (
      <div style={{ padding: '160px 40px', color: 'var(--text-main)', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid #2ecc71' }}>
          <span style={{ fontSize: '60px', color: '#2ecc71' }}>✓</span>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '20px 0 10px 0' }}>ЗАКАЗ УСПЕШНО ОФОРМЛЕН!</h2>
          <p style={{ opacity: 0.7, fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            Спасибо за покупку!
            Заказ сохранён в базе данных.
            {credentials && <span className="account-credentials"><strong>Аккаунт создан. Сохраните данные для входа:</strong><br />Email: {credentials.email}<br />Логин: {credentials.username}<br />Пароль: {credentials.password}</span>}
          </p>
          <div style={{ backgroundColor: 'var(--surface-alt)', padding: '15px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', color: '#e67e22', marginBottom: '30px' }}>
            Номер заказа: {orderNumber}
          </div>
          <button onClick={() => navigate('/catalog')} style={{ padding: '14px 28px', backgroundColor: '#e67e22', color: 'var(--text-main)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            ВЕРНУТЬСЯ В КАТАЛОГ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container" style={{ padding: '120px 40px', color: 'var(--text-main)', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '40px', letterSpacing: '1px' }}>ОФОРМЛЕНИЕ ЗАКАЗА</h2>

      <div style={{ display: 'flex', gap: '40px' }}>

        {/* ЛЕВАЯ ЧАСТЬ: УМНАЯ ФОРМА ДОСТАВКИ */}
        <form onSubmit={handleSubmitOrder} style={{ flex: 1, backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#e67e22', fontWeight: 'bold' }}>
            {!currentUser.id ? '📋 ОФОРМЛЕНИЕ БЕЗ РЕГИСТРАЦИИ (АККАУНТ СОЗДАСТСЯ АВТОМАТИЧЕСКИ)' : '📋 ДАННЫЕ ПОКУПАТЕЛЯ'}
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>ФИО получателя *</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Иванов Иван Иванович" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Контактный телефон *</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 999-99-99" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
          </div>

          {!currentUser.id && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Email (для создания личного кабинета) *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
            </div>
          )}

          {!currentUser.id && <div className="guest-password-field">
            <label htmlFor="account-password">Пароль нового аккаунта (необязательно)</label>
            <input id="account-password" type="password" autoComplete="new-password" minLength={4}
              value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder="Оставьте пустым — пароль будет сгенерирован" />
            <p>Аккаунт создастся вместе с заказом. Данные для входа появятся после оформления.</p>
            <button type="button" onClick={() => navigate('/login')}>У меня уже есть аккаунт</button>
          </div>}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Адрес доставки *</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Город, улица, дом, квартира" rows="3" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', resize: 'none' }} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#2ecc71', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? 'СОЗДАНИЕ УЧЕТНОЙ ЗАПИСИ И ОФОРМЛЕНИЕ...' : 'ОФОРМИТЬ ЗАКАЗ'}
          </button>
        </form>

        {/* ПРАВАЯ ЧАСТЬ: СОСТАВ КОРЗИНЫ */}
        <div style={{ width: '400px', backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>🛒 ВАШ ЗАКАЗ</h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: 'bold' }}>{item.title}</h4>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>Размер: {item.size || 'M'} × {item.quantity || 1} шт.</span>
                </div>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{item.price_str || item.price}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '2px dashed #333', fontSize: '20px', fontWeight: 900 }}>
            <span>ИТОГО:</span>
            <span style={{ color: '#2ecc71' }}>{calculateTotal().toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
