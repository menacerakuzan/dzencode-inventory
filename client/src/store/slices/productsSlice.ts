import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiErrorMessage, productsApi } from '@/lib/api';
import type { NewProduct, Product } from '@/types';
import { deleteOrder, orderRemoved } from './ordersSlice';

export interface ProductFilters {
  type: string;
  specification: string;
}

export interface ProductsState {
  items: Product[];
  filters: ProductFilters;
}

export const emptyFilters: ProductFilters = { type: '', specification: '' };

const initialState: ProductsState = { items: [], filters: emptyFilters };

export const createProduct = createAsyncThunk<Product, NewProduct, { rejectValue: string }>(
  'products/create',
  async (product, { rejectWithValue }) => {
    try {
      return await productsApi.create(product);
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

const upsert = (state: ProductsState, product: Product) => {
  const index = state.items.findIndex((item) => item.id === product.id);
  if (index === -1) state.items.unshift(product);
  else state.items[index] = product;
};

const removeByOrder = (state: ProductsState, orderId: number) => {
  state.items = state.items.filter((item) => item.order !== orderId);
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    productsHydrated(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
    },
    productUpserted: (state, action: PayloadAction<Product>) => upsert(state, action.payload),
    productRemoved(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    typeFilterChanged(state, action: PayloadAction<string>) {
      state.filters = { type: action.payload, specification: '' };
    },
    specificationFilterChanged(state, action: PayloadAction<string>) {
      state.filters.specification = action.payload;
    },
    filtersRestored(state, action: PayloadAction<ProductFilters>) {
      state.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      // Products are removed in the DB by ON DELETE CASCADE, mirror it in the store.
      .addCase(deleteOrder.fulfilled, (state, action) => removeByOrder(state, action.payload))
      .addCase(orderRemoved, (state, action) => removeByOrder(state, action.payload));
  },
});

export const {
  productsHydrated,
  productUpserted,
  productRemoved,
  typeFilterChanged,
  specificationFilterChanged,
  filtersRestored,
} = productsSlice.actions;
export default productsSlice.reducer;
