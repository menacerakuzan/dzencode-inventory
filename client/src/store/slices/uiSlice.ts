import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DeleteTarget = { kind: 'order' | 'product'; id: number };

/** `id: null` — create a new entity, a number — edit the existing one. */
export type OrderForm = { id: number | null };
export type ProductForm = { id: number | null; orderId: number | null };

export interface UiState {
  search: string;
  deleteTarget: DeleteTarget | null;
  orderForm: OrderForm | null;
  productForm: ProductForm | null;
}

const initialState: UiState = {
  search: '',
  deleteTarget: null,
  orderForm: null,
  productForm: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    deleteRequested(state, action: PayloadAction<DeleteTarget>) {
      state.deleteTarget = action.payload;
    },
    deleteDismissed(state) {
      state.deleteTarget = null;
    },
    orderFormOpened(state, action: PayloadAction<OrderForm>) {
      state.orderForm = action.payload;
    },
    orderFormClosed(state) {
      state.orderForm = null;
    },
    productFormOpened(state, action: PayloadAction<ProductForm>) {
      state.productForm = action.payload;
    },
    productFormClosed(state) {
      state.productForm = null;
    },
  },
});

export const {
  searchChanged,
  deleteRequested,
  deleteDismissed,
  orderFormOpened,
  orderFormClosed,
  productFormOpened,
  productFormClosed,
} = uiSlice.actions;
export default uiSlice.reducer;
