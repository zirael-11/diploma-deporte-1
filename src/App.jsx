import React, { useState, useEffect } from 'react';
import './styles/main.scss';
import BannerSlider from './components/BannerSlider';
import { setShopping, resetShopping } from './store/shoppingSlice';
import { api, GUEST } from './api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from './store/productsSlice';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Checkout from './pages/Checkout';
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



import Catalog from './pages/catalog';
import Profile from './pages/profile';
import Favorites from './pages/favorites';
import Cart from './pages/cart';
import ProductPage from './pages/ProductPage';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const banners = [frame1, frame2, frame3, frame4, frame5];
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('deporteTheme') !== 'light');
  useEffect(() => { localStorage.setItem('deporteTheme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);
  const { favorites, cart: cartItems, ready: shoppingReady } = useSelector(state => state.shopping);
  const [toast, setToast] = useState({ isVisible: false, message: '' });
  const [currentUser, setCurrentUser] = useState(GUEST);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.items);
  useEffect(() => {
    dispatch(fetchProducts());
    localStorage.removeItem('currentUser');
    api('/auth/me').then(setCurrentUser).catch(err => {
      if (err.status !== 401) setAuthError(err.message);
    }).finally(() => setAuthReady(true));
  }, [dispatch]);

  const [shoppingBusy, setShoppingBusy] = useState(false);
  const readGuest = () => {
    try { const data = JSON.parse(localStorage.getItem('deporteGuestShopping') || '{}');
      return { cart: Array.isArray(data.cart) ? data.cart : [], favorites: Array.isArray(data.favorites) ? data.favorites : [] };
    } catch { return { cart: [], favorites: [] }; }
  };
  const saveShopping = data => {
    dispatch(setShopping(data));
    if (!currentUser.id) localStorage.setItem('deporteGuestShopping', JSON.stringify(data));
  };
  useEffect(() => {
    if (!authReady) return;
    let active = true;
    dispatch(resetShopping());
    const guest = readGuest();
    if (!currentUser.id) { dispatch(setShopping(guest)); return; }
    const restore = async () => {
      try {
        const data = guest.cart.length || guest.favorites.length
          ? await api('/shopping/import', { method: 'POST', body: JSON.stringify({
              cart: guest.cart.map(item => ({ product_id: String(item.id), quantity: item.quantity, size: item.size || 'M' })),
              favorites: guest.favorites.map(item => String(item.id)),
            }) }) : await api('/shopping');
        if (active) {
          dispatch(setShopping(data));
          localStorage.removeItem('deporteGuestShopping');
        }
      } catch (err) { if (active) setAuthError(err.message); }
    };
    restore();
    return () => { active = false; };
  }, [currentUser.id, authReady, dispatch]);

  const toggleFavorite = async product => {
    if (!shoppingReady || shoppingBusy) return;
    const enabled = !favorites.some(item => item.id === product.id);
    setShoppingBusy(true);
    try {
      if (currentUser.id) saveShopping(await api('/favorites', { method: 'PUT', body: JSON.stringify({ product_id: String(product.id), enabled }) }));
      else saveShopping({ cart: cartItems, favorites: enabled ? [...favorites, product] : favorites.filter(item => item.id !== product.id) });
    } catch (err) { setAuthError(err.message); }
    finally { setShoppingBusy(false); }
  };

  const changeCart = async (product, size, quantity) => {
    if (!shoppingReady || shoppingBusy) return;
    setShoppingBusy(true);
    try {
      if (currentUser.id) saveShopping(await api('/cart', { method: 'PUT', body: JSON.stringify({ product_id: String(product.id), size, quantity }) }));
      else {
        const remaining = cartItems.filter(item => !(item.id === product.id && item.size === size));
        saveShopping({ favorites, cart: quantity > 0 ? [...remaining, { ...product, size, quantity }] : remaining });
      }
      return true;
    } catch (err) { setAuthError(err.message); return false; }
    finally { setShoppingBusy(false); }
  };
  const addToCart = async (product, selectedSize = 'M') => {
    const existing = cartItems.find(item => item.id === product.id && item.size === selectedSize);
    if (await changeCart(product, selectedSize, Math.min(100, (existing?.quantity || 0) + 1)))
      setToast({ isVisible: true, message: `Товар добавлен в корзину! Размер: ${selectedSize}` });
  };
  const updateCartItem = (item, quantity) => changeCart(item, item.size || 'M', quantity);
  const clearCart = () => {
    const guest = readGuest();
    localStorage.setItem('deporteGuestShopping', JSON.stringify({ ...guest, cart: [] }));
    dispatch(setShopping({ favorites, cart: [] }));
  };

  useEffect(() => {
    if (toast.isVisible) {
      const timer = setTimeout(() => setToast({ isVisible: false, message: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.isVisible]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const popularProducts = products.slice(0, 4).map(p => ({ ...p,
    price: p.price_str, priceNum: Number(p.price_num),
    image: `/images/${p.image}`, imageHover: `/images/${p.image_hover}`,
  }));

  // ИСПРАВЛЕНО: Полноценный компонент главной страницы с правильной областью видимости хуков
  const HomePage = () => {
    return (
      <div className="home-page-wrapper">
        <BannerSlider banners={banners} />

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
              {currentUser?.id && (
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
        {authError && <p className="auth-error" role="alert">{authError}</p>}
        <Routes>
          <Route path="/" element={HomePage()} />
          <Route path="/catalog" element={<Catalog favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} currentUser={currentUser} />} />
          <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} addToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} updateCartItem={updateCartItem} busy={shoppingBusy} />} />
          <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
                  <Route
          path="/checkout"
          element={<Checkout cartItems={cartItems} clearCart={clearCart} currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
          <Route path="/profile" element={!authReady ? <p>Проверка сессии…</p> : !currentUser.id ? <Navigate to="/login" replace /> : <Profile currentUser={currentUser} setCurrentUser={setCurrentUser} />} />
        {/* ПУТИ ДЛЯ СТРАНИЦ АВТОРИЗАЦИИ И РЕГИСТРАЦИИ */}
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
