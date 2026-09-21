import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type DeleteTarget = { kind: 'order' | 'product'; id: number };

export interface Toast {
  id: string;
  kind: 'success' | 'error';
  /** Key in the `toast` i18n namespace. */
  messageKey: string;
  values?: Record<string, string | number>;
}

export interface UiState {
  search: string;
  deleteTarget: DeleteTarget | null;
  orderFormOpen: boolean;
  /** `null` — closed, `0` — opened without a preselected order. */
  productFormOrderId: number | null;
  toasts: Toast[];
}

const initialState: UiState = {
  search: '',
  deleteTarget: null,
  orderFormOpen: false,
  productFormOrderId: null,
  toasts: [],
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
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.toasts = [...state.toasts.slice(-3), action.payload];
      },
      prepare: (toast: Omit<Toast, 'id'>) => ({ payload: { ...toast, id: nanoid() } }),
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
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
  toastShown,
  toastDismissed,
} = uiSlice.actions;
export default uiSlice.reducer;
