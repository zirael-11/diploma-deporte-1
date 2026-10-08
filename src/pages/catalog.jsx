import { api } from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 🎯 Хуки Redux
import { fetchProducts } from '../store/productsSlice'; // 🎯 Экшен загрузки базы

function Catalog({ favorites = [], toggleFavorite, addToCart, currentUser }) {
    // Состояния для формы добавления нового товара модератором
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('Форма сборных');
    const [newCountry, setNewCountry] = useState('');
    const [newClub, setNewClub] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [newImage, setNewImage] = useState('spainfuria2026.png');

    // Состояния для модального окна редактирования и просмотра товара
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [modalSize, setModalSize] = useState('M');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

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
            description: "Официальная футбольная экипировка модели премиум-качества.",
            image: newImage,
            image_hover: newImage
        };

        try {
            await api('/products', { method: 'POST', body: JSON.stringify(productPayload) });
            dispatch(fetchProducts());
            alert('Товар добавлен в PostgreSQL');
        } catch (error) {
            console.error(error);
            alert(error.message);
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
    const typesList = ['Домашняя', 'Гостевая', 'Тренировочная', 'Специальная коллекция'];
    const yearsList = ['2026', '2025', '2024', '2023', '2022', '2021'];
    const sizesList = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const priceRanges = [
        { label: 'Все цены', min: 0, max: 99999 },
        { label: 'До 5 000 ₽', min: 0, max: 5000 }
    ];

    // ПОДКЛЮЧАЕМ СТЭЙТ-МЕНЕДЖЕР REDUX И УДАЛЯЕМ СТАТИЧЕСКИЙ MOCKDB
    const [productsList, setProductsList] = useState([]);
    const [selectedMainCat, setSelectedMainCat] = useState('Все');
    const [selectedCountries, setSelectedCountries] = useState([]);
    const [selectedClubs, setSelectedClubs] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedSizes, setSelectedSizes] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const dispatch = useDispatch();
    const { items: reduxProducts, status: productsStatus, error: productsError } = useSelector((state) => state.products);

    // Загружаем товары из PostgreSQL через экшен Redux
    useEffect(() => {
        if (productsStatus === 'idle') {
            dispatch(fetchProducts());
        }
    }, [productsStatus, dispatch]);

    // Синхронизируем локальный массив фильтрации маркетплейса с базой данных
    useEffect(() => {
        if (reduxProducts) {
            setProductsList(reduxProducts);
        }
    }, [reduxProducts]);
    const handleAddProductToCartBackend = product => addToCart?.(product);
    const handleDeleteProduct = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Удалить товар из каталога?')) return;
        try {
            await api(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
            dispatch(fetchProducts());
        } catch (err) { alert(err.message); }
    };

    const handleOpenEditModal = (product) => {
        setIsEditing(false);
        setSelectedProduct(product);
        setEditTitle(product.title);
        setEditPrice(String(product.price_num));
        setEditDescription(product.description || '');
    };

    const handleSaveChanges = async () => {
        const price = Number(editPrice.replace(/\s/g, '').replace(',', '.'));
        if (!Number.isFinite(price) || price < 0) return alert('Укажите корректную цену');
        setSaving(true);
        try {
            await api(`/products/${encodeURIComponent(selectedProduct.id)}`, {
                method: 'PATCH', body: JSON.stringify({ title: editTitle, price_num: price, description: editDescription }),
            });
            dispatch(fetchProducts());
            setSelectedProduct(null);
        } catch (err) { alert(err.message); }
        finally { setSaving(false); }
    };

    const toggleFilter = (item, list, setList) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const handleResetFilters = () => {
        setSelectedMainCat('Все'); setSelectedCountries([]); setSelectedClubs([]); setSelectedTypes([]); setSelectedYears([]); setSelectedSizes([]);
    };

    // Логика пагинации страниц каталога
    const filteredProducts = productsList.filter(p => {
        if (selectedMainCat !== 'Все' && p.main_category !== selectedMainCat) return false;
        const currentRange = priceRanges[selectedPriceRange];
        if (p.price_num < currentRange.min || p.price_num > currentRange.max) return false;
        if (selectedCountries.length > 0 && !selectedCountries.includes(p.country)) return false;
        if (selectedClubs.length > 0 && !selectedClubs.includes(p.club)) return false;
        if (selectedTypes.length > 0 && !selectedTypes.includes(p.type)) return false;
        if (selectedYears.length > 0 && !selectedYears.includes(p.year)) return false;
        return true;
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    return (
        <div className="catalog-page-container flex-layout-catalog">
            {productsError && <p className="auth-error" role="alert">{productsError}</p>}
            {productsStatus === 'loading' && <p>Загрузка каталога…</p>}
            <aside className="catalog-sidebar-filters">
                <div className="sidebar-filter-section">
                    <h4>КАТЕГОРИЯ</h4>
                    <div className="filter-options-list">
                        {mainCategories.map(c => (
                            <label key={c} className="filter-radio-label">
                                <input type="radio" name="mainCat" checked={selectedMainCat === c} onChange={() => setSelectedMainCat(c)} />
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

                <button className="reset-all-filters-btn-premium" onClick={handleResetFilters}>Сбросить фильтры</button>
            </aside>

            <div className="catalog-main-content-right">
                <div className="catalog-results-counter">Найдено позиций: <strong>{filteredProducts.length}</strong></div>

                {currentUser?.role === 'admin' && (
                    <form onSubmit={handleCreateProduct} style={{ backgroundColor: '#1e1e1e', padding: '20px', marginBottom: '20px', borderRadius: '10px' }}>
                        <h3 style={{ color: '#e67e22', margin: '0 0 15px 0' }}>ДОБАВЛЕНИЕ НОВОГО ТОВАРА</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Название</label>
                                <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Например: Джерси Реал Мадрид" style={{ width: '100%', padding: '8px', background: '#333', color: 'var(--text-main)', border: '1px solid #444', borderRadius: '5px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Цена</label>
                                <input type="text" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="5400" style={{ width: '100%', padding: '8px', background: '#333', color: 'var(--text-main)', border: '1px solid #444', borderRadius: '5px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', opacity: 0.7 }}>Категория</label>
                                <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '8px', background: '#333', color: 'var(--text-main)', border: '1px solid #444', borderRadius: '5px' }}>
                                    <option value="Форма сборных">Форма сборных</option>
                                    <option value="Форма по клубам">Форма по клубам</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" style={{ marginTop: '15px', padding: '10px 20px', background: '#e67e22', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Сохранить в базу</button>
                    </form>
                )}

                <div className="products-grid-container grid-4-columns">
                    {currentItems.map(p => {
                        const isFav = favorites.some(f => f.id === p.id);
                        return (
                            <div key={p.id} className="product-item-card" onClick={() => handleOpenEditModal(p)}>
                                <div className="product-card-image-wrapper">
                                    {p.badge && <span className="product-card-badge">{p.badge}</span>}
                                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(p); }} className={`product-card-fav-btn ${isFav ? 'active' : ''}`}>
                                        {isFav ? '❤️' : '🤍'}
                                    </button>
                                    <img
                                        src={p.image.includes('/') ? p.image : `/images/${p.image || 'spainfuria2026.png'}`}
                                        className="product-item-img"
                                        alt={p.title}
                                        onMouseEnter={(e) => { if(p.image_hover) e.currentTarget.src = p.image_hover.includes('/') ? p.image_hover : `/images/${p.image_hover}`; }}
                                        onMouseLeave={(e) => { e.currentTarget.src = p.image.includes('/') ? p.image : `/images/${p.image || 'spainfuria2026.png'}`; }}
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/spainfuria2026.png'; }}
                                    />
                                </div>
                                <div className="product-card-info-content">
                                    <span className="product-card-category-tag">{p.main_category} {p.club ? `| ${p.club}` : ''}</span>
                                    <h4 className={`product-card-item-title ${currentUser?.role === 'admin' ? 'admin' : ''}`}>{p.title}</h4>
                                    <div className="product-card-price-row">
                                        <span className="product-card-current-price">{p.price_str || `${p.price_num} ₽`}</span>
                                        <button className="product-card-buy-btn" onClick={(e) =>  { e.stopPropagation(); handleAddProductToCartBackend(p); }}>
                                            ДОБАВИТЬ В КОРЗИНУ
                                        </button>
                                    </div>
                                    {currentUser?.role === 'admin' && (
                                        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                            <button className="edit-product-button" onClick={e => { e.stopPropagation(); handleOpenEditModal(p); setIsEditing(true); }}>РЕДАКТИРОВАТЬ</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(e, p.id); }} style={{ flex: 1, padding: '4px', background: '#c0392b', color: 'var(--text-main)', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' }}>УДАЛИТЬ ИЗ БАЗЫ</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {totalPages > 1 && (
                    <div className="pagination-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                        <button type="button" onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0, 0); }} disabled={currentPage === 1} style={{ padding: '10px 20px', backgroundColor: currentPage === 1 ? '#222' : '#e67e22', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Назад</button>
                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-main)' }}>Страница {currentPage} из {totalPages}</span>
                        <button type="button" onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0, 0); }} disabled={currentPage === totalPages} style={{ padding: '10px 20px', backgroundColor: currentPage === totalPages ? '#222' : '#e67e22', color: 'var(--text-main)', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Вперед</button>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <div className="modal-backdrop-premium" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setSelectedProduct(null)}>
                    {/* ЧИСТЫЙ ТЕГ БЕЗ ЖЕСТКИХ JS-РЕФОВ И ЦВЕТОВ*/}
                    <div className="product-info-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>✕</button>

                        <div className="modal-product-layout">

                            {/* Левая колонка для картинки */}
                            <div className="modal-product-media">
                                <Link to={`/product/${selectedProduct.id}`} onClick={() => setSelectedProduct(null)} style={{ display: 'block', width: '100%' }}>
                                    <img
                                        src={selectedProduct.image.includes('/') ? selectedProduct.image : `/images/${selectedProduct.image}`}
                                        alt={selectedProduct.title}
                                        className="modal-main-img"
                                    />
                                </Link>
                            </div>

                            {/* Правая колонка с текстом и кнопками */}
                            <div className="modal-product-details">
                                <span className="modal-category-tag">{selectedProduct.main_category}</span>

                                <Link to={`/product/${selectedProduct.id}`} onClick={() => setSelectedProduct(null)} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <h4 className="modal-product-title">{selectedProduct.title}</h4>
                                </Link>

                                <div className="modal-price-box">
                                    <span className="modal-current-price">{selectedProduct.price_str || `${selectedProduct.price_num} ₽`}</span>
                                </div>

                                {currentUser?.role === 'admin' && <button className="edit-product-button" onClick={() => setIsEditing(value => !value)}>
                                  {isEditing ? 'Закрыть редактирование' : 'Редактировать товар'}
                                </button>}
                                {isEditing && currentUser?.role === 'admin' && <form className="product-edit-form" onSubmit={e => { e.preventDefault(); handleSaveChanges(); }}>
                                  <label>Название<input value={editTitle} onChange={e => setEditTitle(e.target.value)} required maxLength={255} /></label>
                                  <label>Цена, ₽<input type="number" min="0" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} required /></label>
                                  <label>Описание<textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} maxLength={500} /></label>
                                  <button type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить в базе'}</button>
                                </form>}
                                <div className="modal-description-block">
                                    <p>{selectedProduct.description || "Премиальная футбольная экипировка оригинального качества. Изготовлена из высокотехнологичных дышащих материалов."}</p>
                                </div>

                                <div className="modal-size-selector-block">
                                    <h5>ВЫБЕРИТЕ РАЗМЕР:</h5>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {sizesList.map(sz => (
                                            <button
                                                key={sz}
                                                onClick={() => setModalSize(sz)}
                                                className={`modal-size-btn ${modalSize === sz ? 'active' : ''}`}
                                            >
                                                {sz}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="modal-action-buy-btn" onClick={() => { addToCart(selectedProduct, modalSize); setSelectedProduct(null); }}>
                                    ДОБАВИТЬ В КОРЗИНУ
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Catalog;
