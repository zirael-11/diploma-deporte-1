import React, { useState } from 'react';

function Profile({ currentUser, setCurrentUser }) {
  // 'login', 'register' или 'profile' (если вошли)
  const [authScreen, setAuthScreen] = useState('register');

  // Поля авторизации
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Поля регистрации строго со скриншота
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Локальный стейт зарегистрированных пользователей
  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'user@mail.ru', password: 'user', name: 'Иван' }
  ]);

  // Обработка авторизации
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      alert('Пожалуйста, заполните все поля!');
      return;
    }

    // Проверка на Администратора
    if (loginUsername.toLowerCase() === 'admin' && loginPassword === 'admin') {
      setCurrentUser({ name: 'Ника (Админ)', role: 'moderator' });
      return;
    }

    // Проверка обычного юзера
    const foundUser = registeredUsers.find(
      (u) => u.email.toLowerCase() === loginUsername.toLowerCase() && u.password === loginPassword
    );

    if (foundUser) {
      setCurrentUser({ name: foundUser.name, role: 'user' });
    } else {
      alert('Неверный Email или пароль! (Для админки: admin / admin)');
    }
  };

  // Обработка регистрации
  const handleRegister = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regSurname.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      alert('Пожалуйста, заполните все обязательные поля со звездочкой!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }

    const newUser = { email: regEmail, password: regPassword, name: regName };
    setRegisteredUsers((prev) => [...prev, newUser]);

    alert('Регистрация успешна! Теперь вы можете войти.');
    setLoginUsername(regEmail);
    setAuthScreen('login');

    // Очистка
    setRegName(''); setRegSurname(''); setRegBirthdate(''); setRegEmail(''); setRegPhone(''); setRegPassword(''); setRegConfirmPassword('');
  };

  const handleLogout = () => {
    setCurrentUser({ name: 'Guest', role: 'user' });
    setAuthScreen('register');
  };

  // ЭКРАН 1: РЕГИСТРАЦИЯ (ОДИН В ОДИН ПО ВАШЕМУ СКРИНШОТУ)
  if (currentUser.name === 'Гость' && authScreen === 'register') {
    return (
      <div className="premium-auth-container">
        <h2 className="premium-auth-title">Регистрация</h2>
        
        <form onSubmit={handleRegister} className="premium-auth-form">
          <div className="premium-input-group">
            <label>Имя <span className="required-star">*</span></label>
            <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} />
          </div>

          <div className="premium-input-group">
            <label>Фамилия <span className="required-star">*</span></label>
            <input type="text" value={regSurname} onChange={(e) => setRegSurname(e.target.value)} />
          </div>

          <div className="premium-input-group">
            <label>Дата рождения</label>
            <input type="date" value={regBirthdate} onChange={(e) => setRegBirthdate(e.target.value)} className="date-input-fix" />
          </div>

          <div className="premium-input-group">
            <label>Email <span className="required-star">*</span></label>
            <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
          </div>

          <div className="premium-input-group">
            <label>Телефон <span className="required-star">*</span></label>
            <input type="tel" placeholder="+7 (___) ___-__-__" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
          </div>

          <div className="premium-input-group">
            <label>Пароль <span className="required-star">*</span></label>
            <div className="password-input-wrapper">
              <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              <span className="eye-icon-mock">👁</span>
            </div>
          </div>

          <div className="premium-input-group">
            <label>Подтверждение пароля <span className="required-star">*</span></label>
            <div className="password-input-wrapper">
              <input type="password" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} />
              <span className="eye-icon-mock">👁</span>
            </div>
          </div>

          <button type="submit" className="premium-submit-btn">Зарегистрироваться</button>
        </form>

        <div className="premium-auth-footer-text">
          У вас уже есть аккаунт? <span className="purple-link-btn" onClick={() => setAuthScreen('login')}>Войти</span>
        </div>
      </div>
    );
  }

  // ЭКРАН 2: АВТОРИЗАЦИЯ (В ТОМ ЖЕ МИНИМАЛИСТИЧНОМ СТИЛЕ)
  if (currentUser.name === 'Гость' && authScreen === 'login') {
    return (
      <div className="premium-auth-container">
        <h2 className="premium-auth-title">Авторизация</h2>
        
        <form onSubmit={handleLogin} className="premium-auth-form">
          <div className="premium-input-group">
            <label>Email или Логин <span className="required-star">*</span></label>
            <input type="text" placeholder="Введите ваш email..." value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} />
          </div>

          <div className="premium-input-group">
            <label>Пароль <span className="required-star">*</span></label>
            <div className="password-input-wrapper">
              <input type="password" placeholder="Введите ваш пароль..." value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              <span className="eye-icon-mock">👁</span>
            </div>
          </div>

          <button type="submit" className="premium-submit-btn">Войти на сайт</button>
        </form>

        <div className="premium-auth-footer-text">
          Еще нет аккаунта? <span className="purple-link-btn" onClick={() => setAuthScreen('register')}>Зарегистрироваться</span>
        </div>
      </div>
    );
  }

   // ЭКРАН 3: АВТОРИЗОВАННЫЙ ЛИЧНЫЙ КАБИНЕТ (В НОВОЙ СТИЛИСТИКЕ)
  return (
    <div className="premium-profile-cabinet-container">
      <span className="premium-cabinet-subtitle">Успешный вход в аккаунт</span>
      <h2 className="premium-auth-title" style={{ marginBottom: '10px' }}>{currentUser.name}</h2>
      
      <div className="premium-cabinet-badge-row">
        <span className={`premium-status-badge-indicator ${currentUser.role}`}>
          {currentUser.role === 'moderator' ? '🛠️ Модератор сайта' : '👤 Авторизованный клиент'}
        </span>
      </div>

      <div className="premium-cabinet-info-block">
        <div className="premium-info-status-row">
          <span className="info-dot-bullet">•</span>
          <span className="info-label-text">Статус системы:</span>
          <span className="info-value-status-active">Сессия активна (State)</span>
        </div>
        
        <div className="premium-info-status-row">
          <span className="info-dot-bullet">•</span>
          <span className="info-label-text">Доступ к витрине:</span>
          <span className="info-value-text-bold">
            {currentUser.role === 'moderator' ? 'Полные права администрирования' : 'Пользовательские права (Покупка)'}
          </span>
        </div>
      </div>

      {/* ОВАЛЬНАЯ СТИЛЬНАЯ КНОПКА ВЫХОДА */}
      <button className="premium-cabinet-logout-btn" onClick={handleLogout}>
        Выйти из аккаунта
      </button>
    </div>
  );
}

export default Profile;