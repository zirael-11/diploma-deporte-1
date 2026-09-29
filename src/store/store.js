import { configureStore } from '@reduxjs/toolkit';
import productsReducer from './productsSlice';

export const store = configureStore({
  reducer: {
    products: productsReducer, // слайс товаров успешно подключен к глобальному дереву
  },
});