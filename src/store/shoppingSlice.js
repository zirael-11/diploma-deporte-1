import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({
  name: 'shopping', initialState: { cart: [], favorites: [], ready: false },
  reducers: {
    setShopping(state, action) {
      state.cart = action.payload.cart;
      state.favorites = action.payload.favorites;
      state.ready = true;
    },
    resetShopping(state) { state.cart = []; state.favorites = []; state.ready = false; },
  },
});
export const { setShopping, resetShopping } = slice.actions;
export default slice.reducer;
