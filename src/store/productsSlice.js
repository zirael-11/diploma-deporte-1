import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  return new Promise((resolve) => setTimeout(resolve, 50));
});

const CLUBS = {
  "Испания": ["Реал Мадрид", "Барселона", "Севилья", "Атлетико Мадрид", "Жирона"],
  "Англия": ["Арсенал", "Челси", "Манчестер Юнайтед", "Манчестер Сити"],
  "Франция": ["ПСЖ", "Монако", "Лион"],
  "Германия": ["Боруссия Дортмунд", "Бавария", "Унион Берлин"],
  "Италия": ["Милан", "Ювентус", "Интер", "Парма"],
  "Россия": ["Зенит", "Спартак", "ЦСКА", "Локомотив"]
};

const COUNTRIES = Object.keys(CLUBS);
const TYPES = ["Домашняя", "Гостевая", "Ретро", "Специальная коллекция", "Тренировочная"];

const generate120Products = () => {
  const list = [];

  for (let i = 1; i <= 120; i++) {
    const cat = i % 2 === 0 ? "Форма сборных" : "Форма по клубам";
    const country = COUNTRIES[i % COUNTRIES.length];
    const type = TYPES[i % TYPES.length];
    const year = String(2022 + (i % 5));
    const price = 3900 + ((i * 35) % 5000);
    
    let club = null;
    let title = "";
    let img = "spainfuria2026.png"; // Значение по умолчанию

    // 🎯 АВТОМАТИЧЕСКАЯ УМНАЯ ПОДСТАНОВКА КАРТИНКИ ПОД КОМАНДУ
    if (country === "Англия") {
      img = "englandhome2026.png";
    } else if (country === "Россия") {
      img = "russiaussr.png";
    } else if (country === "Германия") {
      img = "germangost2026.png";
    } else if (country === "Италия") {
      img = "italysbor2026.png";
    } else if (country === "Испания") {
      img = "spainfuria2026.png";
    } else {
      img = "spainfuria2026.png"; // Заглушка для Франции
    }

    if (cat === "Форма по клубам") {
      const clubList = CLUBS[country];
      club = clubList[i % clubList.length];
      title = `${type} форма ФК ${club} (${year})`;
    } else {
      title = `${type} форма сборной ${country} (${year})`;
    }

    list.push({
      id: String(i),
      title: title,
      main_category: cat,
      country: country,
      club: club,
      year: year,
      type: type,
      price_num: price,
      price_str: `${price.toLocaleString('ru-RU')} ₽`,
      image: img,
      image_hover: img
    });
  }
  return list;
};

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: generate120Products(),
    status: 'succeeded',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state) => {
        state.status = 'succeeded';
      });
  }
});

export default productsSlice.reducer;