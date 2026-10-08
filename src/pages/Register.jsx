import { api } from '../api';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!login || !email || !password) {
      return setError('Пожалуйста, заполните все обязательные поля!');
    }

    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ username: login, email, password }) });

      alert('Регистрация прошла успешно! Теперь вы можете войти.');
      navigate('/login'); // Перенаправляем на страницу входа

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '140px 40px', color: 'var(--text-main)', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '25px', letterSpacing: '1px', textAlign: 'center' }}>РЕГИСТРАЦИЯ</h2>

        {error && <div style={{ color: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #e74c3c' }}>{error}</div>}

        <form onSubmit={handleRegisterSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Ваше имя (Логин) *</label>
            <input type="text" value={login} onChange={e => setLogin(e.target.value)} placeholder="Nika_Deporte" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Email адрес *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nika@example.com" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Пароль *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', backgroundColor: 'var(--surface-alt)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#2ecc71', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            СОЗДАТЬ АККАУНТ
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: '#e67e22', textDecoration: 'underline' }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
