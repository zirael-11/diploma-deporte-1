import React, { useState, useEffect } from 'react';



function Catalog({ favorites = [], toggleFavorite, addToCart, currentUser }) {
   // Состояния для формы добавления нового товара модератором
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Форма сборных');
  const [newCountry, setNewCountry] = useState('');
  const [newClub, setNewClub] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState('spainfuria2026.png');
    const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newTitle || !newPrice) return alert('Заполните название и цену!');

    const cleanPriceNum = parseInt(newPrice.replace(/[^\d]/g, '')) || 0;
    const formattedPriceStr = `${cleanPriceNum.toLocaleString('ru-RU')} ₽`;

    const productPayload = {
      title: newTitle,
      main_category: newCategory,
      country: newCountry || null,
      club: newClub || null,
      year: "2026",
      type: "Домашняя",
      price_num: cleanPriceNum,
      price_str: formattedPriceStr,
      description: `Официальная футбольная экипировка модели премиум-качества.`,
      image: newImage,
      image_hover: newImage
    };

    try {
      const response = await fetch('http://localhost/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      if (response.ok) {
        alert('🎉 Товар успешно добавлен в PostgreSQL через Nginx!');
        // Перезагружаем страницу, чтобы обновить список из БД
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при добавлении товара');
    }
  };
  const mainCategories = ['Все', 'Форма сборных', 'Форма по клубам', 'Бутсы', 'Мячи'];
  const countriesList = ['Испания', 'Германия', 'Англия', 'Франция', 'Италия', 'Россия'];
  const clubLeagues = {
    'Испания': ['Реал Мадрид', 'Барселона', 'Севилья', 'Атлетико Мадрид', 'Жирона'],
    'Англия': ['Арсенал', 'Челси', 'Манчестер Юнайтед', 'Манчестер Сити'],
    'Франция': ['ПСЖ', 'Монако', 'Лион'],
    'Германия': ['Боруссия Дортмунд', 'Бавария', 'Унион Берлин'],
    'Италия': ['Милан', 'Ювентус', 'Интер', 'Парма']
  };
  const allClubs = Object.values(clubLeagues).flat();
  const typesList = ['Домашняя', 'Гостевая', 'Специальная коллекция'];
  const yearsList = ['2026', '2025', '2024', '2023', '2022'];
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
  const priceRanges = [{ label: 'Все цены', min: 0, max: 99999 }, { label: 'До 5 000 ₽', min: 0, max: 5000 }, { label: 'До 5 000 - 7 500 ₽', min: 5000, max: 7500 }, { label: 'До 7 500 - 12 000 ₽', min: 7500, max: 12000 }, { label: 'До 12 000 ₽ и дороже', min: 12000, max: 99999 }];

  const [selectedMainCat, setSelectedMainCat] = useState('Все');
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSize, setModalSize] = useState('M');
  const [productsList, setProductsList] = useState([]);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDescription] = useState('');

  const spainKits = [['spainfuria2026.png', 'spain2furia2026.png'], ['spaindelafuente.png', 'spaindelafuente2.png'], ['spainflores.png', 'spainflores2.png']];
  const germanKits = [['germanhome2026.png', 'german2home2026.png'], ['germangost2026.png', 'german2gost2026.png']];
  const italyKits = [['italysbor2026.png', 'italy2sbor2026.png'], ['italy2026.png', 'italy2026_2.png'], ['italyspets2025.png', 'italy2spets2025.png']];
  const englandKits = [['englandhome2026.png', 'england2home2026.png'], ['englandguest2026.png', 'england2guest2026.png']];
  const russiaKits = [['russiaussr.png', 'russiaussr2.png']];

  useEffect(() => {
    const mockDb = [];
    let globalId = 1;

    countriesList.forEach((country) => {
      for (let i = 1; i <= 4; i++) {
        const year = yearsList[i % yearsList.length];
        const type = typesList[i % typesList.length];
        const priceNum = 4500 + i * 400;

        let currentKitPool = spainKits;
        if (country === 'Германия') currentKitPool = germanKits;
        if (country === 'Италия') currentKitPool = italyKits;
        if (country === 'Англия') currentKitPool = englandKits;
        if (country === 'Россия') currentKitPool = russiaKits;

        const imgPair = currentKitPool[i % currentKitPool.length];
        mockDb.push({ id: globalId++, title: `${type} форма сборной: ${country} (${year})`, mainCategory: 'Форма сборных', country, club: null, year, type, priceNum, price: `${priceNum.toLocaleString('ru-RU')} ₽`, oldPrice: i % 3 === 0 ? '7 500 ₽' : null, badge: i === 1 ? 'NEW' : null, description: `Официальная экипировка национальной команды ${country} футбольного сезона ${year}.`, image: imgPair[0], imageHover: imgPair[1] });
      }
    });

    let clubCounter = 0;
    Object.keys(clubLeagues).forEach((leagueName, clIdx) => {
      clubLeagues[leagueName].forEach((club) => {
        clubCounter++;
        for (let i = 1; i <= 2; i++) {
          let currentKitPool = spainKits;
          if (leagueName === 'Германия') currentKitPool = germanKits;
          if (leagueName === 'Италия') currentKitPool = italyKits;
          if (leagueName === 'Англия') currentKitPool = englandKits;

          const imgPair = currentKitPool[(clIdx + clubCounter + i) % currentKitPool.length];
          const year = yearsList[(clubCounter + i) % yearsList.length];
          const type = typesList[(clubCounter + i) % typesList.length];
          const priceNum = 5990 + i * 300;
          mockDb.push({ id: globalId++, title: `${type} форма ФК ${club} ${year}`, mainCategory: 'Форма по клубам', country: leagueName, club, year, type, priceNum, price: `${priceNum.toLocaleString('ru-RU')} ₽`, oldPrice: i === 2 ? '8 200 ₽' : null, badge: i === 1 ? 'TOP' : null, description: `Лицензионная форма футбольного клуба ${club}. Модель ${year} года.`, image: imgPair[0], imageHover: imgPair[1] });
        }
      });
    });

    const extraKits = [{ cat: 'Бутсы', n: ['Nike', 'Adidas', 'Puma'] }, { cat: 'Мячи', n: ['UCL Pro', 'Flight', 'Orbita'] }];
    extraKits.forEach(k => {
      for (let i = 1; i <= 10; i++) {
        let pool = spainKits;
        if (i % 4 === 0) pool = germanKits;
        if (i % 4 === 1) pool = italyKits;
        if (i % 4 === 2) pool = englandKits;

        const imgPair = pool[i % pool.length];
        const priceNum = k.cat === 'Бутсы' ? 11000 + i * 400 : 3500 + i * 300;
        mockDb.push({ id: globalId++, title: `${k.cat === 'Бутсы' ? 'Бутсы' : 'Мяч'} ${k.n[i % 3]} Pro`, mainCategory: k.cat, country: null, club: null, year: '2026', type: 'Специальная коллекция', priceNum, price: `${priceNum.toLocaleString('ru-RU')} ₽`, oldPrice: null, badge: null, description: `Профессиональный инвентарь высшего качества.`, image: imgPair[0], imageHover: imgPair[1] });
      }
    });

    setProductsList(mockDb);
  }, []);

  const handleDeleteProduct = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Вы уверены, что хотите удалить товар?')) { setProductsList(prev => prev.filter(p => p.id !== id)); }
  };

  const handleOpenEditModal = (product) => {
    setSelectedProduct(product); setEditTitle(product.title); setEditPrice(product.price); setEditDescription(product.description);
  };

  const handleSaveChanges = () => {
    const cleanPriceNum = parseInt(editPrice.replace(/[^\d]/g, '')) || 5000;
    setProductsList(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, title: editTitle, price: editPrice, priceNum: cleanPriceNum, description: editDesc } : p));
    setSelectedProduct(null);
  };
  const filteredProducts = productsList.filter(p => {
    if (selectedMainCat !== 'Все' && p.mainCategory !== selectedMainCat) return false;
    const currentRange = priceRanges[selectedPriceRange];
    if (p.priceNum < currentRange.min || p.priceNum > currentRange.max) return false;
    if (selectedCountries.length > 0 && !selectedCountries.includes(p.country)) return false;
    if (selectedClubs.length > 0 && !selectedClubs.includes(p.club)) return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) return false;
    if (selectedYears.length > 0 && !selectedYears.includes(p.year)) return false;
    return true;
  });

  const toggleFilter = (item, list, setList) => { 
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]); 
  };
  
  const handleResetFilters = () => { 
    setSelectedMainCat('Все'); setSelectedCountries([]); setSelectedClubs([]); setSelectedTypes([]); setSelectedYears([]); setSelectedSizes([]); setSelectedPriceRange(0); 
  };

  return (
    <div className="catalog-page-container flex-layout-catalog">
      <aside className="catalog-sidebar-filters">
        <div className="sidebar-filter-section">
          <h4>КАТЕГОРИЯ</h4>
          <div className="filter-options-list">
            {mainCategories.map(c => (
              <label key={c} className="filter-radio-label">
                <input type="radio" name="mainCat" checked={selectedMainCat === c} onChange={() => { setSelectedMainCat(c); setSelectedCountries([]); setSelectedClubs([]); }} />
                <span className="custom-radio"></span> {c}
              </label>
            ))}
          </div>
        </div>
        <div className="sidebar-filter-section">
          <h4>ТИП ЭКИПИРОВКИ</h4>
          <div className="filter-options-list">
            {typesList.map(type => (
              <label key={type} className="filter-checkbox-label">
                <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)} />
                <span className="custom-checkbox"></span> {type}
              </label>
            ))}
          </div>
        </div>
        {(selectedMainCat === 'Все' || selectedMainCat === 'Форма сборных' || selectedMainCat === 'Форма по клубам') && (
          <div className="sidebar-filter-section">
            <h4>СТРАНЫ</h4>
            <div className="filter-options-list scrollable-options">
              {countriesList.map(country => (
                <label key={country} className="filter-checkbox-label">
                  <input type="checkbox" checked={selectedCountries.includes(country)} onChange={() => toggleFilter(country, selectedCountries, setSelectedCountries)} />
                  <span className="custom-checkbox"></span> {country}
                </label>
              ))}
            </div>
          </div>
        )}
        {(selectedMainCat === 'Все' || selectedMainCat === 'Форма по клубам') && (
          <div className="sidebar-filter-section">
            <h4>КЛУБЫ</h4>
            <div className="filter-options-list scrollable-options">
              {allClubs.map(club => (
                <label key={club} className="filter-checkbox-label">
                  <input type="checkbox" checked={selectedClubs.includes(club)} onChange={() => toggleFilter(club, selectedClubs, setSelectedClubs)} />
                  <span className="custom-checkbox"></span> {club}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="sidebar-filter-section">
          <h4>ЦЕНА</h4>
          <div className="filter-options-list">
            {priceRanges.map((range, index) => (
              <label key={index} className="filter-radio-label">
                <input type="radio" name="priceRange" checked={selectedPriceRange === index} onChange={() => setSelectedPriceRange(index)} />
                <span className="custom-radio"></span> {range.label}
              </label>
            ))}
          </div>
        </div>
        <div className="sidebar-filter-section">
          <h4>ГОД ВЫПУСКА</h4>
          <div className="filter-options-list">
            {yearsList.map(year => (
              <label key={year} className="filter-checkbox-label">
                <input type="checkbox" checked={selectedYears.includes(year)} onChange={() => toggleFilter(year, selectedYears, setSelectedYears)} />
                <span className="custom-checkbox"></span> {year}
              </label>
            ))}
          </div>
        </div>
        <div className="sidebar-filter-section">
          <h4>РАЗМЕР</h4>
          <div className="filter-options-list">
            {sizesList.map(size => (
              <label key={size} className="filter-checkbox-label">
                <input type="checkbox" checked={selectedSizes.includes(size)} onChange={() => toggleFilter(size, selectedSizes, setSelectedSizes)} />
                <span className="custom-checkbox"></span> {size}
              </label>
            ))}
          </div>
        </div>
        <button className="reset-all-filters-btn-premium" onClick={handleResetFilters}><span className="refresh-icon-svg">↻</span> Сбросить фильтры</button>
      </aside>

      <div className="catalog-main-content-right">
        <div className="catalog-results-counter">Найдено позиций: <strong>{filteredProducts.length}</strong></div>
        {/* ИСПРАВЛЕНО: Панель добавления нового товара строго для модератора */}
        {currentUser.role === 'moderator' && (
          <form onSubmit={handleCreateProduct} style={{ backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '2px dashed #e67e22', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ color: '#e67e22', margin: 0, fontWeight: 900 }}>⚙️ ДОБАВЛЕНИЕ НОВОГО ТОВАРА В POSTGRESQL</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Название товара:</label>
                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Например: Форма ФК Зенит" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Стоимость (₽):</label>
                <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="Например: 5500" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Категория:</label>
                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }}>
                  <option value="Форма сборных">Форма сборных</option>
                  <option value="Форма по клубам">Форма по клубам</option>
                  <option value="Бутсы">Бутсы</option>
                  <option value="Мячи">Мячи</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Страна (если форма):</label>
                <input type="text" value={newCountry} onChange={e => setNewCountry(e.target.value)} placeholder="Например: Россия" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Клуб (если клубная):</label>
                <input type="text" value={newClub} onChange={e => setNewClub(e.target.value)} placeholder="Например: Зенит" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Файл картинки из assets:</label>
                <select value={newImage} onChange={e => setNewImage(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#111', color: '#fff' }}>
                  <option value="russiaussr.png">Россия (russiaussr.png)</option>
                  <option value="englandhome2026.png">Англия (englandhome2026.png)</option>
                  <option value="spainfuria2026.png">Испания (spainfuria2026.png)</option>
                  <option value="germanhome2026.png">Германия (germanhome2026.png)</option>
                  <option value="italysbor2026.png">Италия (italysbor2026.png)</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ backgroundColor: '#e67e22', color: '#fff', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' }}>СОХРАНИТЬ В БАЗУ ДАННЫХ 💾</button>
          </form>
        )}
        <div className="products-grid-container grid-4-columns">
          {filteredProducts.map(p => {
            const isFav = favorites.some(f => f.id === p.id);
            return (
              <div key={p.id} className="product-item-card" onClick={() => handleOpenEditModal(p)}>
                <div className="product-card-image-wrapper">
                  {p.badge && <span className="product-card-badge">{p.badge}</span>}
                  <button className={`product-card-fav-btn ${isFav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }}>❤</button>
                  {currentUser.role === 'moderator' && ( <button className="admin-delete-product-btn" onClick={(e) => handleDeleteProduct(e, p.id)}>✕</button> )}
                  <img 
                    src={`/src/assets/images/${p.image || 'spainfuria2026.png'}`} 
                    className="product-item-img" 
                    alt={p.title} 
                    onMouseEnter={(e) => e.currentTarget.src = `/src/assets/images/${p.image_hover || p.imageHover || p.image || 'spain2furia2026.png'}`} 
                    onMouseLeave={(e) => e.currentTarget.src = `/src/assets/images/${p.image || 'spainfuria2026.png'}`} 
                    onError={(e) => { 
                      // Если ховер-картинка отсутствует в assets, принудительно возвращаем лицо, чтобы вёрстка не ломалась
                      e.currentTarget.src = `/src/assets/images/${p.image || 'spainfuria2026.png'}`; 
                    }}
                  />
                </div>
                <div className="product-card-info-content">
                  <span className="product-card-category-tag">{p.mainCategory} {p.club ? `› ${p.club}` : p.country ? `› ${p.country}` : ''}</span>
                  <h4 className={`product-card-item-title ${currentUser.role === 'moderator' ? 'moderator-editable-title' : ''}`}>{p.title} {currentUser.role === 'moderator' && <span style={{fontSize:'10px', color:'#e67e22'}}>⚙</span>}</h4>
                  <div className="product-card-price-row"><span className="product-card-current-price">{p.price}</span>{p.oldPrice && <span className="product-card-old-price">{p.oldPrice}</span>}</div>
                  <button className="product-card-buy-btn" onClick={(e) => { e.stopPropagation(); addToCart(p, 'M'); }}>В КОРЗИНУ</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-info-modal-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>✕</button>
            <div className="modal-product-layout">
              <div className="modal-product-media"><img src={`/src/assets/images/${selectedProduct.image}`} alt={selectedProduct.title} className="modal-main-img" onMouseEnter={(e) => e.currentTarget.src = `/src/assets/images/${selectedProduct.image_hover || selectedProduct.imageHover || selectedProduct.image}`} onMouseLeave={(e) => e.currentTarget.src = `/src/assets/images/${selectedProduct.image}`} /></div>
              <div className="modal-product-details">
                {currentUser.role === 'moderator' ? (
                  <div className="admin-editor-panel-form" style={{display:'flex', flexDirection:'column', gap:'10px', width:'100%'}}>
                    <span className="modal-category-tag" style={{color:'#e67e22', fontWeight:'900'}}>РЕЖИМ РЕДАКТИРОВАНИЯ КАРТОЧКИ</span>
                    <div><label>Название товара:</label><input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="admin-panel-input" /></div>
                    <div><label>Стоимость товара:</label><input type="text" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="admin-panel-input" /></div>
                    <div><label>Описание модели:</label><textarea value={editDesc} onChange={(e) => setEditDescription(e.target.value)} className="admin-panel-input admin-textarea" rows="3" /></div>
                    <button className="modal-action-buy-btn" onClick={handleSaveChanges} style={{backgroundColor:'#e67e22', marginTop:'10px'}}>СОХРАНИТЬ ИЗМЕНЕНИЯ 💾</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="modal-category-tag">{selectedProduct.mainCategory}</span>
                      <button className={`modal-fav-inline-btn ${favorites.some(f => f.id === selectedProduct.id) ? 'active' : ''}`} onClick={() => toggleFavorite(selectedProduct)}>❤</button>
                    </div>
                    <h3 className="modal-product-title">{selectedProduct.title}</h3>
                    <div className="modal-price-box"><span className="modal-current-price">{selectedProduct.price}</span>{selectedProduct.oldPrice && <span className="modal-old-price" style={{marginLeft:'15px', opacity:0.35, textDecoration:'line-through'}}>{selectedProduct.oldPrice}</span>}</div>
                    <div className="modal-description-block"><h5>ОПИСАНИЕ МОДЕЛИ</h5><p>{selectedProduct.description}</p>
                                          <ul>
                        <li><strong>Тип экипировки:</strong> {selectedProduct.type}</li>
                        <li><strong>Год выпуска:</strong> Сезон {selectedProduct.year}</li>
                      </ul>
                    </div>

                    <div className="modal-size-selector-block">
                      <h5>ВЫБЕРИТЕ РАЗМЕР:</h5>
                      <div className="modal-sizes-grid">
                        {sizesList.map(sz => (
                          <button 
                            key={sz} 
                            className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`} 
                            onClick={() => setModalSize(sz)}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      className="modal-action-buy-btn" 
                      onClick={() => { 
                        addToCart(selectedProduct, modalSize); 
                        setSelectedProduct(null); 
                      }}
                    >
                      ДОБАВИТЬ В КОРЗИНУ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Catalog;