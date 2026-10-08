import { useShopTranslation } from '../i18n/useShopTranslation';
import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Checkout({ cartItems = [], clearCart, currentUser, setCurrentUser }) {
  const { t, productText, formatMoney } = useShopTranslation();
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
    if (!fullName.trim() || !phone.trim() || !address.trim()) return alert(t("Заполните данные доставки"));
    if (!cartItems.length) return alert(t("Корзина пуста"));
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
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '20px 0 10px 0' }}>{t("ЗАКАЗ УСПЕШНО ОФОРМЛЕН!")}</h2>
          <p style={{ opacity: 0.7, fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            {t("Спасибо за покупку! Заказ сохранён в базе данных.")}
            {credentials && <span className="account-credentials"><strong>{t("Аккаунт создан. Сохраните данные для входа:")}</strong><br />Email: {credentials.email}<br />{t("Логин:")} {credentials.username}<br />{t("Пароль:")} {credentials.password}</span>}
          </p>
          <div style={{ backgroundColor: 'var(--surface-alt)', padding: '15px', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', color: '#e67e22', marginBottom: '30px' }}>
            {t("Номер заказа:")} {orderNumber}
          </div>
          <button onClick={() => navigate('/catalog')} style={{ padding: '14px 28px', backgroundColor: '#e67e22', color: 'var(--text-main)', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t("ВЕРНУТЬСЯ В КАТАЛОГ")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container" style={{ padding: '120px 40px', color: 'var(--text-main)', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '40px', letterSpacing: '1px' }}>{t("ОФОРМЛЕНИЕ ЗАКАЗА")}</h2>

      <div style={{ display: 'flex', gap: '40px' }}>

        {/* ЛЕВАЯ ЧАСТЬ: УМНАЯ ФОРМА ДОСТАВКИ */}
        <form onSubmit={handleSubmitOrder} style={{ flex: 1, backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#e67e22', fontWeight: 'bold' }}>
            {!currentUser.id ? t("📋 ОФОРМЛЕНИЕ БЕЗ РЕГИСТРАЦИИ (АККАУНТ СОЗДАСТСЯ АВТОМАТИЧЕСКИ)") : t("📋 ДАННЫЕ ПОКУПАТЕЛЯ")}
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>{t("ФИО получателя *")}</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder={t("Иванов Иван Иванович")} style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>{t("Контактный телефон *")}</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 (999) 999-99-99" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
          </div>

          {!currentUser.id && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>{t("Email (для создания личного кабинета) *")}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} required />
            </div>
          )}

          {!currentUser.id && <div className="guest-password-field">
            <label htmlFor="account-password">{t("Пароль нового аккаунта (необязательно)")}</label>
            <input id="account-password" type="password" autoComplete="new-password" minLength={4}
              value={accountPassword} onChange={e => setAccountPassword(e.target.value)} placeholder={t("Оставьте пустым — пароль будет сгенерирован")} />
            <p>{t("Аккаунт создастся вместе с заказом. Данные для входа появятся после оформления.")}</p>
            <button type="button" onClick={() => navigate('/login')}>{t("У меня уже есть аккаунт")}</button>
          </div>}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>{t("Адрес доставки *")}</label>
            <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder={t("Город, улица, дом, квартира")} rows="3" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px', resize: 'none' }} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#2ecc71', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? t("СОЗДАНИЕ УЧЕТНОЙ ЗАПИСИ И ОФОРМЛЕНИЕ...") : t("ОФОРМИТЬ ЗАКАЗ")}
          </button>
        </form>

        {/* ПРАВАЯ ЧАСТЬ: СОСТАВ КОРЗИНЫ */}
        <div style={{ width: '400px', backgroundColor: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>{t("🛒 ВАШ ЗАКАЗ")}</h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
            {cartItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222' }}>
                <div>
                  <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: 'bold' }}>{productText(item, 'title')}</h4>
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>{t("Размер:")} {item.size || 'M'} × {item.quantity || 1} {t('шт.')}</span>
                </div>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{formatMoney(item.price_num ?? item.priceNum)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '2px dashed #333', fontSize: '20px', fontWeight: 900 }}>
            <span>{t("ИТОГО:")}</span>
            <span style={{ color: '#2ecc71' }}>{formatMoney(calculateTotal())}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Checkout;
