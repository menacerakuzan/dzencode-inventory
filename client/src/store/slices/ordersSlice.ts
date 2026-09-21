import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { apiErrorMessage, ordersApi } from '@/lib/api';
import type { NewOrder, Order } from '@/types';

export interface OrdersState {
  items: Order[];
  selectedId: number | null;
}

const initialState: OrdersState = { items: [], selectedId: null };

const byDateDesc = (a: Order, b: Order) => b.date.localeCompare(a.date) || b.id - a.id;

export const createOrder = createAsyncThunk<Order, NewOrder, { rejectValue: string }>(
  'orders/create',
  async (order, { rejectWithValue }) => {
    try {
      return await ordersApi.create(order);
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

const upsert = (state: OrdersState, order: Order) => {
  const index = state.items.findIndex((item) => item.id === order.id);
  if (index === -1) state.items.push(order);
  else state.items[index] = order;
  state.items.sort(byDateDesc);
};

const remove = (state: OrdersState, id: number) => {
  state.items = state.items.filter((item) => item.id !== id);
  if (state.selectedId === id) state.selectedId = null;
};

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
    /** Real-time sync: events from other tabs arrive through Socket.io. */
    orderUpserted: (state, action: PayloadAction<Order>) => upsert(state, action.payload),
    orderRemoved: (state, action: PayloadAction<number>) => remove(state, action.payload),
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, action) => upsert(state, action.payload))
      .addCase(deleteOrder.fulfilled, (state, action) => remove(state, action.payload));
  },
});

export const { ordersHydrated, orderSelected, orderUpserted, orderRemoved } = ordersSlice.actions;
export default ordersSlice.reducer;
