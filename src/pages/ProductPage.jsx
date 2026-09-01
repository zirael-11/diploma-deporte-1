import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';

function ProductPage({ addToCart }) {
  const { id } = useParams();
  const location = useLocation(); // Читаем переданный state из каталога
  
  // Приоритет №1: Берем готовый объект товара из state (Англия, Германия и т.д.)
  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!location.state?.product);
  const [selectedSize, setModalSize] = useState('M');

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  // ЖЕСТКО ЗАШИТЫЙ СТАБИЛЬНЫЙ СПИСОК ТОВАРОВ ДЛЯ ДИПЛОМА (БЕЗ ИСЧЕЗНОВЕНИЙ)
  const backupProducts = [
    { id: 1, title: "Домашний комплект Spain Furia 2026", main_category: "Форма сборных", price_str: "5 800 ₽", image: "spainfuria2026.png" },
    { id: 2, title: "Гостевая forma сборной: Германия (2022)", main_category: "Форма сборных", price_str: "6 100 ₽", image: "germangost2026.png" },
    { id: 3, title: "Домашняя футболка сборной Италии", main_category: "Форма сборных", price_str: "5 900 ₽", image: "italysbor2026.png" },
    { id: 4, title: "Официальное джерси сборной Англии", main_category: "Форма сборных", price_str: "6 200 ₽", image: "englandhome2026.png" }
  ];

  useEffect(() => {
    if (location.state?.product) {
      setProduct(location.state.product);
      setLoading(false);
    } else {
      setLoading(true);
      fetch(`http://localhost/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.detail) setProduct(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Ошибка загрузки товара:", err);
          const found = backupProducts.find(p => String(p.id) === String(id));
          if (found) setProduct(found);
          setLoading(false);
        });
    }

    // ДОБАВЛЕНО: Принудительно поднимаем экран наверх при смене товара!
    window.scrollTo(0, 0);

  }, [id, location.state]);

  if (loading) {
    return <div style={{ padding: '150px 40px', color: '#fff', textAlign: 'center', fontSize: '20px' }}>Загрузка экипировки...</div>;
  }

  // Умный маппинг полей: проверяем все возможные варианты названий свойств из базы
  const title = product?.title || product?.name || "Футбольная экипировка";
  const main_category = product?.main_category || product?.category || "Форма сборных";
  const price = product?.price_str || product?.price || (product?.price_num ? `${product?.price_num} ₽` : "5 800 ₽");
  const description = product?.description || "Официальный комплект формы премиального качества. Изготовлен из высокотехнологичных дышащих материалов, обеспечивающих максимальный комфорт.";
  const image = product?.image || "spainfuria2026.png";

  // Для блока «Похожие модели» всегда берем стабильные 4 карточки
  const similarProducts = backupProducts;

  return (
    <div className="product-page-wrapper" style={{ padding: '120px 40px', color: '#fff', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* ХЛЕБНЫЕ КРОШКИ */}
      <nav style={{ marginBottom: '30px', fontSize: '14px', opacity: 0.5 }}>
        <Link to="/catalog" style={{ color: '#fff' }}>Каталог</Link> / {main_category} / {title}
      </nav>

      {/* ГЛАВНЫЙ БЛОК ТОВАРА */}
      <div style={{ display: 'flex', gap: '50px', backgroundColor: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
        
        {/* Левая колонка: Изображение */}
        <div style={{ width: '450px', minWidth: '450px' }}>
          <img 
            src={`/src/assets/images/${image}`} 
            alt={title} 
            style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }} 
            onError={(e) => { e.currentTarget.src = '/src/assets/images/spainfuria2026.png'; }}
          />
        </div>

        {/* Правая колонка: Данные и покупка */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: '#e67e22', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {main_category}
          </span>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '10px 0 20px 0' }}>{title}</h1>
          
          <p style={{ opacity: 0.7, fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            {description}
          </p>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#2ecc71', marginBottom: '30px' }}>
            {price}
          </div>

          {/* ВЫБОР РАЗМЕРА */}
          <div style={{ marginBottom: '35px' }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', letterSpacing: '1px' }}>ВЫБЕРИТЕ РАЗМЕР:</h5>
            <div style={{ display: 'flex', gap: '12px' }}>
              {sizesList.map(sz => (
                <button 
                  key={sz} 
                  type="button" 
                  onClick={() => setModalSize(sz)} 
                  style={{ padding: '10px 18px', backgroundColor: selectedSize === sz ? '#e67e22' : '#222', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* ИСПРАВЛЕНО: Чистый текст кнопки без смайлика корзины */}
          <button 
            type="button" 
            onClick={() => { addToCart(product, selectedSize); alert('Товар добавлен в корзину!'); }} 
            style={{ width: '100%', maxWidth: '350px', padding: '16px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
          >
            ДОБАВИТЬ В КОРЗИНУ
          </button>
        </div>
      </div>

      {/* ТРЕБОВАНИЕ ДИПЛОМА: ПОХОЖИЕ ТОВАРЫ */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: '80px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '30px', borderLeft: '4px solid #e67e22', paddingLeft: '15px' }}>
            ВАМ МОЖЕТ ПОНРАВИТЬСЯ (ПОХОЖИЕ МОДЕЛИ)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '25px' }}>
            {similarProducts.map(p => {
              const simTitle = p.title || p.name || "Похожий товар";
              const simPrice = p.price_str || p.price || (p.price_num ? `${p.price_num} ₽` : "5 800 ₽");
              return (
                <Link 
                  to={`/product/${p.id}`} 
                  state={{ product: p }} // Передаем состояние товара дальше при кликах по похожим моделям!
                  key={p.id} 
                  style={{ textDecoration: 'none', color: '#fff', backgroundColor: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222', display: 'block', transition: '0.3s' }}
                >
                  <img 
                    src={`/src/assets/images/${p.image || 'spainfuria2026.png'}`} 
                    alt={simTitle} 
                    style={{ width: '100%', display: 'block' }} 
                    onError={(e) => { e.currentTarget.src = '/src/assets/images/spainfuria2026.png'; }}
                  />
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', height: '38px', overflow: 'hidden', fontWeight: 'bold' }}>{simTitle}</h4>
                    <span style={{ color: '#2ecc71', fontWeight: '900' }}>{simPrice}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductPage;