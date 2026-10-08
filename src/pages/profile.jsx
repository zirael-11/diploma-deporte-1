import { useShopTranslation } from '../i18n/useShopTranslation';
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { api, GUEST } from '../api';

function Profile({ currentUser, setCurrentUser }) {
  const { t, productText, formatMoney } = useShopTranslation();
  const [usersList, setUsersList] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try { setUsersList(await api('/users')); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    if (currentUser?.role === 'admin') loadUsers();
  }, [currentUser?.id, currentUser?.role]);
  const handleLogout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); setCurrentUser(GUEST); }
    catch (err) { setError(err.message); }
  };
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(t('Удалить пользователя {{name}} и его заказы?', { name: userName }))) return;
    try {
      await api(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setError('');
    } catch (err) { setError(err.message); }
  };
  if (!currentUser?.id) return <Navigate to="/login" replace />;

  // ЭКРАН 3: АВТОРИЗОВАННЫЙ ЛИЧНЫЙ КАБИНЕТ
  if (currentUser?.id) {
    return (
      <div className="premium-cabinet-container" style={{ padding: '120px 40px', color: 'var(--text-main)', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <span className="premium-cabinet-subtitle" style={{ opacity: 0.5, fontSize: '14px', textTransform: 'uppercase' }}>{t("Успешный вход в аккаунт")}</span>
          <h2 className="premium-auth-title" style={{ fontSize: '36px', fontWeight: 900, marginTop: '5px', marginBottom: '20px' }}>{currentUser.role === 'admin' ? t('Администратор') : currentUser.name}</h2>

          <div className="premium-cabinet-badge-row" style={{ marginBottom: '30px' }}>
            <span style={{ padding: '8px 16px', backgroundColor: currentUser.role === 'admin' ? 'rgba(230, 126, 34, 0.2)' : 'rgba(46, 204, 113, 0.2)', color: currentUser.role === 'admin' ? '#e67e22' : '#2ecc71', borderRadius: '20px', fontWeight: 'bold', border: currentUser.role === 'admin' ? '1px solid #e67e22' : '1px solid #2ecc71' }}>
              {currentUser.role === 'admin' ? t("⚡ Модератор сайта") : t("👤 Авторизованный клиент")}
            </span>
          </div>

          <div className="premium-cabinet-info-block" style={{ backgroundColor: 'var(--surface-alt)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div className="premium-info-status-row" style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
              <span className="info-label-text" style={{ opacity: 0.6 }}>{t("Статус системы:")}</span>
              <span className="info-value-status-active" style={{ color: 'var(--success-text)', fontWeight: 'bold' }}>{t("Сессия активна в Redis")}</span>
            </div>
            <div className="premium-info-status-row" style={{ display: 'flex', gap: '15px' }}>
              <span className="info-label-text" style={{ opacity: 0.6 }}>{t("Права доступа:")}</span>
              <span className="info-value-text-bold" style={{ fontWeight: 'bold' }}>
                {currentUser.role === 'admin' ? t("Полные права администрирования") : t("Пользовательские права")}
              </span>
            </div>
          </div>

          {/* СТРОГО ТРЕБОВАНИЕ ДИПЛОМА: ФУНКЦИОНАЛ МОДЕРАТОРА ДЛЯ УПРАВЛЕНИЯ ЗАКАЗАМИ И КЛИЕНТАМИ */}
          {currentUser.role === 'admin' && (
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #333' }}>
              <h3 style={{ color: 'var(--accent-text)', fontSize: '22px', fontWeight: 900, marginBottom: '25px', letterSpacing: '1px' }}>
                {t("🛠️ УПРАВЛЕНИЕ КЛИЕНТАМИ И ЗАКАЗАМИ (POSTGRESQL)")}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={loadUsers} disabled={loading}>{t("Обновить список")}</button>
                {loading && <p>{t("Загрузка пользователей…")}</p>}
                {usersList.map(user => (
                  <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface-alt)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>{user.name} <span style={{ opacity: 0.4, fontSize: '14px' }}>{user.id}</span></div>
                      <div style={{ fontSize: '14px', color: 'var(--success-text)', marginTop: '4px' }}>Email: {user.email}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px', fontStyle: 'italic' }}>{t("📦 Заказ:")} {t(user.order, { defaultValue: user.order })}</div>
                    </div>
                    <button
                      disabled={user.role === 'admin'}
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      style={{ backgroundColor: '#e74c3c', color: 'var(--text-main)', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                    >
                      {t("Удалить из БД")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <p role="alert">{error}</p>}
          <button
            className="premium-cabinet-logout-btn"
            onClick={handleLogout}
            style={{ marginTop: '40px', padding: '14px 28px', backgroundColor: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e74c3c'; }}
          >
            {t("Выйти из аккаунта")}
          </button>
        </div>
      </div>
    );
  }

  return <Navigate to="/login" replace />;
}

export default Profile;
