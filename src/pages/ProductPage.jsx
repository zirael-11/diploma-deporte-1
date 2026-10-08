import { imageUrl } from '../api';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux'; // 🎯 Подключаем чтение из Redux Toolkit

function ProductPage({ addToCart }) {
  // 🎯 Считываем ID товара из адресной строки браузера (например, "1", "2" или "4")
  const { id } = useParams();

  // Забираем список товаров напрямую из Redux Store
  const { items: products } = useSelector((state) => state.products);

  // Находим именно тот товар, ID которого совпадает с текущей страницей
  const product = products.find(p => p.id === String(id));

  const [selectedSize, setSelectedSize] = useState('M');
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

  // Если вдруг товар с таким ID не найден (например, ввели вручную плохой ID)
  if (!product) {
    return (
      <div style={{ padding: '40px', color: 'var(--text-main)', textAlign: 'center' }}>
        <h2>Товар не найден</h2>
        <Link to="/" style={{ color: '#e67e22' }}>Вернуться в каталог</Link>
      </div>
    );
  }

  return (
    <div className="product-page-container" style={{ color: 'var(--text-main)', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

      {/* Хлебные крошки для навигации */}
      <div className="breadcrumbs" style={{ fontSize: '13px', opacity: 0.5, marginBottom: '20px' }}>
        <Link to="/" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Каталог</Link> / {product.main_category} / {product.title}
      </div>

      <div className="product-main-layout" style={{ display: 'flex', gap: '50px', background: 'var(--surface)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>

        {/* Левая колонка: Крупное изображение товара */}
        <div className="product-image-side" style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'var(--surface-alt)', borderRadius: '12px', padding: '20px' }}>
          <img
            src={imageUrl(product.image)}
            alt={product.title}
            style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' }}
          />
        </div>

        {/* Правая колонка: Текстовая информация, размеры и кнопка */}
        <div className="product-info-side" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <span style={{ color: '#e67e22', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {product.main_category} {product.club ? `| ${product.club}` : ''}
          </span>

          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', lineHeight: '1.2' }}>
            {product.title}
          </h1>

          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
            {product.description || "Официальный комплект формы премиального качества. Изготовлен из высокотехнологичных дышащих материалов, обеспечивающих максимальный комфорт."}
          </p>

          <div style={{ fontSize: '14px', color: '#888' }}>
            <div><strong>Страна:</strong> {product.country}</div>
            {product.club && <div><strong>Клуб:</strong> {product.club}</div>}
            <div><strong>Сезон:</strong> {product.year} гг.</div>
            <div><strong>Тип экипировки:</strong> {product.type}</div>
          </div>

          <div style={{ color: '#27ae60', fontWeight: 'bold', fontSize: '36px', margin: '10px 0' }}>
            {product.price_str || `${product.price_num} ₽`}
          </div>

          {/* Селектор размеров */}
          <div className="size-selector-section">
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', opacity: 0.6, marginBottom: '10px' }}>ВЫБЕРИТЕ РАЗМЕР:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {sizesList.map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '8px 16px',
                    background: selectedSize === sz ? '#e67e22' : '#222',
                    color: 'var(--text-main)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: '0.2s'
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка добавления в корзину */}
          <button
            onClick={() => addToCart({ ...product, selectedSize })}
            style={{
              width: '100%',
              padding: '15px',
              background: '#27ae60',
              color: 'var(--text-main)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px',
              transition: '0.2s'
            }}
          >
            ДОБАВИТЬ В КОРЗИНУ
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductPage;
