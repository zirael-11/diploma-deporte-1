import { configureStore } from '@reduxjs/toolkit';
import products from './productsSlice';
import shopping from './shoppingSlice';
export const store = configureStore({ reducer: { products, shopping } });
