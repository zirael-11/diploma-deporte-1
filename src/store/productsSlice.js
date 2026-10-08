import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../api';
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => api('/products'));
const productsSlice = createSlice({
  name: 'products', initialState: { items: [], status: 'idle', error: null }, reducers: {},
  extraReducers: builder => builder
    .addCase(fetchProducts.pending, state => { state.status = 'loading'; state.error = null; })
    .addCase(fetchProducts.fulfilled, (state, action) => { state.status = 'succeeded'; state.items = action.payload; })
    .addCase(fetchProducts.rejected, (state, action) => { state.status = 'failed'; state.error = action.error.message; }),
});
export default productsSlice.reducer;
