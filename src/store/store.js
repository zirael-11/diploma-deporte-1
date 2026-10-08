import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import products from './productsSlice';
import shopping from './shoppingSlice';
import language, { setLanguage } from '../slices/languageSlice';
import i18n from '../i18n/index.js';

const languageListener = createListenerMiddleware();
languageListener.startListening({
  actionCreator: setLanguage,
  effect: async (_action, listenerApi) => {
    const selected = listenerApi.getState().language.currentLanguage;
    await i18n.changeLanguage(selected);
    try { localStorage.setItem('deporteLanguage', selected); } catch { /* Storage may be unavailable. */ }
  },
});

export const store = configureStore({
  reducer: { products, shopping, language },
  middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(languageListener.middleware),
});
