import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login({ setCurrentUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Пожалуйста, заполните все поля, а то не круто чел!');
    }

    try {
      // Стучимся на FastAPI бэкенд через Nginx прокси
      const response = await fetch('http://localhost/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Неверный email или пароль');
      }

      // Если бэкенд и Redis одобрили сессию,сохраняем пользователя
      alert('Успешный вход в систему!');
      setCurrentUser({
        name: data.user.username,
        role: 'user', // Или подставляем data.user.role, если добавлю модератора (пиздец)
        email: data.user.email
      });
      
      navigate('/profile'); // Перенаправляем в личный кабинет

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '140px 40px', color: '#fff', maxWidth: '450px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '25px', letterSpacing: '1px', textAlign: 'center' }}>ВХОД В АККАУНТ</h2>
        
        {error && <div style={{ color: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #e74c3c' }}>{error}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Email адрес</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@deporte.com" style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '14px', opacity: 0.6, marginBottom: '8px' }}>Пароль</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px' }} />
          </div>

          <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
            ВОЙТИ ➔
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
          Ещё нет профиля? <Link to="/register" style={{ color: '#2ecc71', textDecoration: 'underline' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;