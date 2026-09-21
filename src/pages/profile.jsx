import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function Profile({ currentUser, setCurrentUser }) {
  // Экранные стейты для регистрации и авторизации встроенных форм
  const [authScreen, setAuthScreen] = useState('register');
  
  // Поля авторизации
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Поля регистрации
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Имитация базы данных пользователей на клиенте
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'user@mail.ru', password: 'user', name: 'Иван' }
  ]);

  // ДЛЯ ПАНЕЛИ МОДЕРАТОРА: Динамический список пользователей в дипломе
  const [usersList, setUsersList] = useState([
    { id: '#8492', name: 'Ника Депорте', email: 'nika@deporte.ru', order: 'DEPORTE-4392 (Домашний комплект Испании, M)' },
    { id: '#1094', name: 'Иван Иванов', email: 'user@mail.ru', order: 'DEPORTE-9214 (Джерси Германии, L)' },
    { id: '#2048', name: 'Максим Петров', email: 'max@mail.ru', order: 'Нет активных заказов' }
  ]);

  // ХЕНДЛЕР ВХОДА (АВТОРИЗАЦИИ)
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      return alert('Пожалуйста, заполните все поля!');
    }

    // Проверка на Администратора / Модератора системы
    if (loginUsername.toLowerCase() === 'admin' && loginPassword === 'admin') {
      setCurrentUser({ name: 'Ника (Админ)', role: 'moderator', email: 'admin@deporte.ru' });
      return;
    }

    // Проверка обычного юзера
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );

    if (foundUser) {
      setCurrentUser({ name: foundUser.name, role: 'user', email: foundUser.email });
    } else {
      alert('Неверный Email или пароль! (Для админки: admin / admin)');
    }
  };

  // ХЕНДЛЕР РЕГИСТРАЦИИ
  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regSurname.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      return alert('Пожалуйста, заполните все обязательные поля со звездочкой!');
    }
    if (regPassword !== regConfirmPassword) {
      return alert('Пароли не совпадают!');
    }

    const newUser = { email: regEmail, password: regPassword, name: regName };
    setRegisteredUsers((prev) => [...prev, newUser]);
    
    alert('Регистрация успешна! Теперь вы можете войти.');
    setAuthScreen('login');
  };

  // ИСПРАВЛЕНО: Хендлер выхода полностью стирает статус и не оставляет висеть надпись Guest
  const handleLogout = () => {
    setCurrentUser({ name: 'Гость', role: 'user' });
    setAuthScreen('login');
  };

  // ФУНКЦИЯ УДАЛЕНИЯ ПОЛЬЗОВАТЕЛЯ МОДЕРАТОРОМ
  const handleDeleteUser = (userId, userName) => {
    setUsersList(prev => prev.filter(u => u.id !== userId));
    alert(`Пользователь ${userName} успешно удален из базы данных PostgreSQL!`);
  };

  // ЭКРАН 3: АВТОРИЗОВАННЫЙ ЛИЧНЫЙ КАБИНЕТ
  if (currentUser && currentUser.name !== 'Гость') {
    return (
      <div className="premium-cabinet-container" style={{ padding: '120px 40px', color: '#fff', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
          <span className="premium-cabinet-subtitle" style={{ opacity: 0.5, fontSize: '14px', textTransform: 'uppercase' }}>Успешный вход в аккаунт</span>
          <h2 className="premium-auth-title" style={{ fontSize: '36px', fontWeight: 900, marginTop: '5px', marginBottom: '20px' }}>{currentUser.name}</h2>
          
          <div className="premium-cabinet-badge-row" style={{ marginBottom: '30px' }}>
            <span style={{ padding: '8px 16px', backgroundColor: currentUser.role === 'moderator' ? 'rgba(230, 126, 34, 0.2)' : 'rgba(46, 204, 113, 0.2)', color: currentUser.role === 'moderator' ? '#e67e22' : '#2ecc71', borderRadius: '20px', fontWeight: 'bold', border: currentUser.role === 'moderator' ? '1px solid #e67e22' : '1px solid #2ecc71' }}>
              {currentUser.role === 'moderator' ? '⚡ Модератор сайта' : '👤 Авторизованный клиент'}
            </span>
          </div>

          <div className="premium-cabinet-info-block" style={{ backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '12px', border: '1px solid #222' }}>
            <div className="premium-info-status-row" style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
              <span className="info-label-text" style={{ opacity: 0.6 }}>Статус системы:</span>
              <span className="info-value-status-active" style={{ color: '#2ecc71', fontWeight: 'bold' }}>Сессия активна в Redis</span>
            </div>
            <div className="premium-info-status-row" style={{ display: 'flex', gap: '15px' }}>
              <span className="info-label-text" style={{ opacity: 0.6 }}>Права доступа:</span>
              <span className="info-value-text-bold" style={{ fontWeight: 'bold' }}>
                {currentUser.role === 'moderator' ? 'Полные права администрирования' : 'Пользовательские права'}
              </span>
            </div>
          </div>

          {/* СТРОГО ТРЕБОВАНИЕ ДИПЛОМА: ФУНКЦИОНАЛ МОДЕРАТОРА ДЛЯ УПРАВЛЕНИЯ ЗАКАЗАМИ И КЛИЕНТАМИ */}
          {currentUser.role === 'moderator' && (
            <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #333' }}>
              <h3 style={{ color: '#e67e22', fontSize: '22px', fontWeight: 900, marginBottom: '25px', letterSpacing: '1px' }}>
                🛠️ УПРАВЛЕНИЕ КЛИЕНТАМИ И ЗАКАЗАМИ (POSTGRESQL)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {usersList.map(user => (
                  <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#161616', padding: '20px', borderRadius: '10px', border: '1px solid #252525' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{user.name} <span style={{ opacity: 0.4, fontSize: '14px' }}>{user.id}</span></div>
                      <div style={{ fontSize: '14px', color: '#2ecc71', marginTop: '4px' }}>Email: {user.email}</div>
                      <div style={{ fontSize: '14px', color: '#aaa', marginTop: '6px', fontStyle: 'italic' }}>📦 Заказ: {user.order}</div>
                    </div>
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                    >
                      Удалить из БД
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            className="premium-cabinet-logout-btn" 
            onClick={handleLogout}
            style={{ marginTop: '40px', padding: '14px 28px', backgroundColor: 'transparent', color: '#e74c3c', border: '2px solid #e74c3c', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e74c3c'; }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    );
  }

  // ЭКРАН 1: ОТЕЧЕСТВЕННАЯ РЕГИСТРАЦИЯ
  if (authScreen === 'register') {
    return (
      <div className="premium-auth-container" style={{ padding: '120px 40px', color: '#fff', maxWidth: '500px', margin: '0 auto' }}>
        <h2 className="premium-auth-title" style={{ fontSize: '32px', fontWeight: 900, marginBottom: '30px', textAlign: 'center' }}>Регистрация</h2>
        <form onSubmit={handleRegister} className="premium-auth-form" style={{ backgroundColor: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Имя <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Введите ваше имя..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Фамилия <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="text" value={regSurname} onChange={(e) => setRegSurname(e.target.value)} placeholder="Введите фамилию..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Дата рождения</label>
                       <input type="date" value={regBirthDate} onChange={(e) => setRegBirthDate(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Email <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="example@mail.ru" style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Телефон <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+7 (___) ___-__-__" style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '15px' }}>
            <label>Пароль <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Введите пароль..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <div className="premium-input-group" style={{ marginBottom: '25px' }}>
            <label>Подтверждение пароля <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
            <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} placeholder="Повторите пароль..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
          </div>
          <button type="submit" className="premium-submit-btn" style={{ width: '100%', padding: '14px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Зарегистрироваться</button>
          <div className="premium-auth-footer-text" style={{ marginTop: '20px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
            У вас уже есть аккаунт? <span className="purple-link-btn" onClick={() => setAuthScreen('login')} style={{ color: '#e67e22', textDecoration: 'underline', cursor: 'pointer' }}>Войти</span>
          </div>
        </form>
      </div>
    );
  }

  // ЭКРАН 2: ОТЕЧЕСТВЕННЫЙ ЛОГИН (ВЫЗЫВАЕТСЯ ПО УМОЛЧАНИЮ)
  return (
    <div className="premium-auth-container" style={{ padding: '120px 40px', color: '#fff', maxWidth: '500px', margin: '0 auto' }}>
      <h2 className="premium-auth-title" style={{ fontSize: '32px', fontWeight: 900, marginBottom: '30px', textAlign: 'center' }}>Авторизация</h2>
      <form onSubmit={handleLogin} className="premium-auth-form" style={{ backgroundColor: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
        <div className="premium-input-group" style={{ marginBottom: '15px' }}>
          <label>Email или Логин <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
          <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} placeholder="Введите ваш email..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
        </div>
        <div className="premium-input-group" style={{ marginBottom: '25px' }}>
          <label>Пароль <span className="required-star" style={{ color: '#e74c3c' }}>*</span></label>
          <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Введите ваш пароль..." style={{ width: '100%', padding: '12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', marginTop: '6px' }} />
        </div>
        <button type="submit" className="premium-submit-btn" style={{ width: '100%', padding: '14px', backgroundColor: '#e67e22', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Войти на сайт</button>
        <div className="premium-auth-footer-text" style={{ marginTop: '20px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
          Еще нет аккаунта? <span className="purple-link-btn" onClick={() => setAuthScreen('register')} style={{ color: '#2ecc71', textDecoration: 'underline', cursor: 'pointer' }}>Зарегистрироваться</span>
        </div>
      </form>
    </div>
  );
}

export default Profile;