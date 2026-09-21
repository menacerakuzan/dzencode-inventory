import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiErrorMessage, productsApi } from '@/lib/api';
import type { Product, ProductInput } from '@/types';
import { deleteOrder } from './ordersSlice';

export interface ProductsState {
  items: Product[];
  /** Selected product type, '' — all types. */
  typeFilter: string;
}

const initialState: ProductsState = { items: [], typeFilter: '' };

export const createProduct = createAsyncThunk<Product, ProductInput, { rejectValue: string }>(
  'products/create',
  async (product, { rejectWithValue }) => {
    try {
      return await productsApi.create(product);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const updateProduct = createAsyncThunk<Product, { id: number; product: ProductInput }, { rejectValue: string }>(
  'products/update',
  async ({ id, product }, { rejectWithValue }) => {
    try {
      return await productsApi.update(id, product);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const deleteProduct = createAsyncThunk<number, number, { rejectValue: string }>(
  'products/delete',
  async (id, { rejectWithValue }) => {
    try {
      await productsApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productsHydrated(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    typeFilterChanged(state, action: PayloadAction<string>) {
      state.typeFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      // Products are removed in the DB by ON DELETE CASCADE, mirror it in the store.
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.order !== action.payload);
      });
  },
});

export const { productsHydrated, typeFilterChanged } = productsSlice.actions;
export default productsSlice.reducer;
