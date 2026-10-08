import { createSlice } from '@reduxjs/toolkit';

export const supportedLanguages = ['ru', 'en', 'es'];
export function getSavedLanguage() {
  try {
    const saved = localStorage.getItem('deporteLanguage');
    return supportedLanguages.includes(saved) ? saved : 'ru';
  } catch { return 'ru'; }
}

const languageSlice = createSlice({
  name: 'language',
  initialState: { currentLanguage: getSavedLanguage() },
  reducers: {
    setLanguage(state, action) {
      if (supportedLanguages.includes(action.payload)) state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
