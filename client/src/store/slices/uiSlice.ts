import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type DeleteTarget = { kind: 'order' | 'product'; id: number };

export interface UiState {
  search: string;
  deleteTarget: DeleteTarget | null;
  orderFormOpen: boolean;
  /** `null` — closed, `0` — opened without a preselected order. */
  productFormOrderId: number | null;
}

const initialState: UiState = {
  search: '',
  deleteTarget: null,
  orderFormOpen: false,
  productFormOrderId: null,
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
    orderFormToggled(state, action: PayloadAction<boolean>) {
      state.orderFormOpen = action.payload;
    },
    productFormOpened(state, action: PayloadAction<number | undefined>) {
      state.productFormOrderId = action.payload ?? 0;
    },
    productFormClosed(state) {
      state.productFormOrderId = null;
    },
  },
});

export const {
  searchChanged,
  deleteRequested,
  deleteDismissed,
  orderFormToggled,
  productFormOpened,
  productFormClosed,
} = uiSlice.actions;
export default uiSlice.reducer;
