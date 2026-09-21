import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiErrorMessage, ordersApi } from '@/lib/api';
import type { Order, OrderInput } from '@/types';

export interface OrdersState {
  items: Order[];
  selectedId: number | null;
}

const initialState: OrdersState = { items: [], selectedId: null };

const byDateDesc = (a: Order, b: Order) => b.date.localeCompare(a.date) || b.id - a.id;

export const createOrder = createAsyncThunk<Order, OrderInput, { rejectValue: string }>(
  'orders/create',
  async (order, { rejectWithValue }) => {
    try {
      return await ordersApi.create(order);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const updateOrder = createAsyncThunk<Order, { id: number; order: OrderInput }, { rejectValue: string }>(
  'orders/update',
  async ({ id, order }, { rejectWithValue }) => {
    try {
      return await ordersApi.update(id, order);
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

export const deleteOrder = createAsyncThunk<number, number, { rejectValue: string }>(
  'orders/delete',
  async (id, { rejectWithValue }) => {
    try {
      await ordersApi.remove(id);
      return id;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    ordersHydrated(state, action: PayloadAction<Order[]>) {
      state.items = [...action.payload].sort(byDateDesc);
      if (state.selectedId !== null && !state.items.some((o) => o.id === state.selectedId)) {
        state.selectedId = null;
      }
    },
    orderSelected(state, action: PayloadAction<number | null>) {
      state.selectedId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.items.sort(byDateDesc);
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.items.sort(byDateDesc);
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedId === action.payload) state.selectedId = null;
      });
  },
});

export const { ordersHydrated, orderSelected } = ordersSlice.actions;
export default ordersSlice.reducer;
