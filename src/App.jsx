import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import frame1 from './assets/images/frame1.png';
import frame2 from './assets/images/frame2.png';
import frame3 from './assets/images/frame3.png';
import frame4 from './assets/images/frame4.png';
import frame5 from './assets/images/frame5.png';

import ball from './assets/icons/ball.svg';
import cart from './assets/icons/cart.svg';
import heart from './assets/icons/heart.svg';
import phone from './assets/icons/phone.svg';
import search from './assets/icons/search.svg';
import sunIcon from './assets/icons/sun.svg';   
import moonIcon from './assets/icons/moon.svg'; 
import userIcon from './assets/icons/user.svg'; 

import spainfuria2026 from './assets/images/spainfuria2026.png';
import spain2furia2026 from './assets/images/spain2furia2026.png';
import spaindelafuente from './assets/images/spaindelafuente.png';
import spaindelafuente2 from './assets/images/spaindelafuente2.png';
import spainflores from './assets/images/spainflores.png';
import spainflores2 from './assets/images/spainflores2.png';
import spainvratar from './assets/images/spainvratar.png';
import spainvratar2 from './assets/images/spainvratar2.png';

import germanhome2026 from './assets/images/germanhome2026.png';
import german2home2026 from './assets/images/german2home2026.png';
import germangost2026 from './assets/images/germangost2026.png';
import german2gost2026 from './assets/images/german2gost2026.png';
import germantrenirovka26 from './assets/images/germantrenirovka26.png';
import german2trenirovka26 from './assets/images/german2trenirovka26.png';

import Catalog from './pages/catalog';
import Profile from './pages/profile';
import Favorites from './pages/favorites';
import Cart from './pages/cart';

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [frame1, frame2, frame3, frame4, frame5];
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [cartItems, setCartItems] = useState([]); 
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const [currentUser, setCurrentUser] = useState({ name: 'Гость', role: 'user' });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide, banners.length]);

  const toggleFavorite = (product) => {
    setFavorites((prev) => {
      const isAlreadyFav = prev.some((item) => item.id === product.id);
      return isAlreadyFav ? prev.filter((item) => item.id !== product.id) : [...prev, product];
    });
  };

  const addToCart = (product, selectedSize = 'M') => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.size === selectedSize);
      if (existingItem) {
        return prevItems.map((item) => item.id === product.id && item.size === selectedSize ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prevItems, { ...product, size: selectedSize, quantity: 1 }];
    });
    setToast({ isVisible: true, message: `Товар добавлен в корзину! Размер: ${selectedSize}` });
  };

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => setToast({ isVisible: false, message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const popularProducts = [
    { id: 101, title: 'Домашний комплект Spain Furia 2026', price: '5 800 ₽', priceNum: 5800, category: 'Форма', image: spainfuria2026, imageHover: spain2furia2026, mainCategory: 'Форма сборных', country: 'Испания', club: null, year: '2026', type: 'Домашняя', description: 'Официальный комплект формы сборной Испании.' },
    { id: 102, title: 'Домашняя форма сборной Германии 2026', price: '6 100 ₽', priceNum: 6100, category: 'Форма', image: germanhome2026, imageHover: german2home2026, mainCategory: 'Форма сборных', country: 'Германия', club: null, year: '2026', type: 'Домашняя', description: 'Классический домашний белый комплект сборной Германии Манншафт.' },
    { id: 103, title: 'Гостевая форма сборной Германии (2026)', price: '4 900 ₽', priceNum: 4900, category: 'Форма', image: germangost2026, imageHover: german2gost2026, mainCategory: 'Форма сборных', country: 'Германия', club: null, year: '2026', type: 'Гостевая', description: 'Трендовый выездной комплект немецкой сборной.' },
    { id: 104, title: 'Тренировочный лонгслив Германии 2026', price: '6 500 ₽', priceNum: 6500, category: 'Спец.коллекция', image: germantrenirovka26, imageHover: german2trenirovka26, mainCategory: 'Форма сборных', country: 'Германия', club: null, year: '2026', type: 'Специальная коллекция', description: 'Официальная разминочная экипировка для тренировок.' }
  ];

  // ИСПРАВЛЕНО: Полноценный компонент главной страницы с правильной областью видимости хуков
  const HomePage = () => {
    return (
      <div className="home-page-wrapper">
        <main className="hero-slider-section">
          <button className="slider-arrow arrow-left" onClick={() => setCurrentSlide(c => c === 0 ? banners.length - 1 : c - 1)}>❮</button>
          <div className="slide-viewport">
            <img key={currentSlide} src={banners[currentSlide]} alt="Баннер" className="banner-img banner-img-fade" />
          </div>
          <button className="slider-arrow arrow-right" onClick={() => setCurrentSlide(c => c === banners.length - 1 ? 0 : c + 1)}>❯</button>
        </main>

        <section className="home-popular-section">
          <div className="section-title-container">
            <h3 className="home-section-title">ХИТЫ ПРОДАЖ</h3>
            <p className="home-section-subtitle">Популярные комплекты экипировки этого сезона</p>
          </div>

          <div className="home-products-grid">
            {popularProducts.map((p) => {
              const isFav = favorites.some(f => f.id === p.id);
              return (
                <div key={p.id} className="home-product-card" onClick={() => navigate('/catalog')}>
                  <div className="home-card-image-wrapper">
                    <button className={`product-card-fav-btn ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}>❤</button>
                    <img src={p.image} alt={p.title} className="home-item-img main-img" />
                    <img src={p.imageHover} alt={p.title} className="home-item-img hover-img" />
                  </div>
                  <div className="home-card-info">
                    <span className="home-card-tag">{p.category}</span>
                    <h4 className="home-card-title">{p.title}</h4>
                    <div className="home-card-footer">
                      <span className="home-card-price">{p.price}</span>
                      <button className="home-card-buy-btn" onClick={(e) => { e.stopPropagation(); addToCart(p, 'M'); }}>🛒</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* БЕГУЩАЯ СТРОКА С КРИЧАЛКАМИ ДЛЯ ДИПЛОМА DEPORTE (БЕСКОНЕЧНАЯ) */}
          <div className="football-marquee-container" style={{ overflow: 'hidden', width: '100%', backgroundColor: 'var(--bg-accent, #2ecc71)', padding: '15px 0', margin: '40px 0', display: 'flex', alignItems: 'center', userSelect: 'none', borderTop: '2px solid var(--text-main)', borderBottom: '2px solid var(--text-main)' }}>
            <div className="football-marquee-track">
              <span>OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽&nbsp;</span>
              <span>OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽&nbsp;</span>
              <span>OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽ OLE!! GOOOOOL!! OLE!! ⚽&nbsp;</span>
            </div>
          </div>

          <div className="more-products-link-container">
            <button className="view-more-btn" onClick={() => navigate('/catalog')}>
              СМОТРЕТЬ БОЛЬШЕ ТОВАРОВ <span className="arrow-icon">➔</span>
            </button>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className={`custom-toast-notification ${toast.isVisible ? 'show' : ''}`}>
        <span className="toast-success-icon">✓</span>
        <div className="toast-message-text">{toast.message}</div>
      </div>
      
      <header className="main-header">
        <div className="header-left">
          <button className="catalog-btn" onClick={() => navigate('/catalog')}>☰ КАТАЛОГ</button>
        </div>
        <div className="header-center" style={{ display: 'flex', justifyContent: 'center', flexGrow: 1 }}>
          <div className="brand-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: '0 auto' }}>
            <img src={ball} alt="Мяч" style={{ width: '26px', height: '26px', filter: 'var(--icon-filter)' }} />
            <span style={{ fontWeight: 900, letterSpacing: '1px' }}>DEPORTE</span>
          </div>
        </div>
        <div className="header-right">
          <div className="phone-container">
            <img src={phone} alt="Телефон" className="phone-icon" />
            <a href="tel:89181141728" className="phone-number">8 (918) 114-17-28</a>
          </div>
          <button className="nav-icon-btn" onClick={() => navigate('/catalog')}>
            <img src={search} alt="Поиск" className="custom-icon" />
          </button>
          
          {/* ИСПРАВЛЕНО: иконка профиля, под которой пишется имя вошедшего аккаунта */}
          <button className="nav-icon-btn premium-header-user-btn" onClick={() => navigate('/profile')} title="Личный кабинет">
            <div className="header-user-icon-container">
              <img src={userIcon} alt="Профиль" className="custom-icon" />
              {currentUser && currentUser.name !== 'Гость' && (
                <span className={`header-user-name-label ${currentUser.role}`}>
                  {currentUser.name.split(' ')[0]} {/* Берем только первое имя без фамилии, чтобы не растягивать шапку */}
                </span>
              )}
            </div>
          </button>
          
          <button className="nav-icon-btn cart-btn" onClick={() => navigate('/favorites')}>
            <img src={heart} alt="Избранное" className="custom-icon" />
            {favorites.length > 0 && <span className="cart-badge" style={{ backgroundColor: '#2ecc71' }}>{favorites.length}</span>}
          </button>
          <button className="nav-icon-btn cart-btn" onClick={() => navigate('/cart')}>
            <img src={cart} alt="Корзина" className="custom-icon" />
            {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
          </button>
          <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}><img src={isDarkMode ? sunIcon : moonIcon} alt="Тема" className="custom-icon theme-icon-img" /></button>
        </div>
      </header>
      <div className="page-content-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<Catalog favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} currentUser={currentUser} />} />
          <Route path="/profile" element={<Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;