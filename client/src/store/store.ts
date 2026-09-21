import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { writeStoredFilters } from '@/lib/storage';
import orders, { createOrder, deleteOrder } from './slices/ordersSlice';
import products, {
  createProduct,
  deleteProduct,
  specificationFilterChanged,
  typeFilterChanged,
} from './slices/productsSlice';
import session from './slices/sessionSlice';
import ui, { toastShown } from './slices/uiSlice';

export const rootReducer = combineReducers({ orders, products, session, ui });
export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware<RootState>();

  // Web Storage: remember the product filters between visits.
  listener.startListening({
    matcher: isAnyOf(typeFilterChanged, specificationFilterChanged),
    effect: (_action, api) => writeStoredFilters(api.getState().products.filters),
  });

  // Notifications are a side effect of thunk results, so components don't have to handle them.
  for (const [creator, messageKey] of [
    [createOrder.fulfilled, 'orderCreated'],
    [createProduct.fulfilled, 'productCreated'],
  ] as const) {
    listener.startListening({
      actionCreator: creator,
      effect: (action, api) => {
        api.dispatch(toastShown({ kind: 'success', messageKey, values: { title: action.payload.title } }));
      },
    });
  }

  for (const [creator, messageKey] of [
    [deleteOrder.fulfilled, 'orderDeleted'],
    [deleteProduct.fulfilled, 'productDeleted'],
  ] as const) {
    listener.startListening({
      actionCreator: creator,
      effect: (_action, api) => {
        api.dispatch(toastShown({ kind: 'success', messageKey }));
      },
    });
  }

  for (const creator of [createOrder.rejected, deleteOrder.rejected, createProduct.rejected, deleteProduct.rejected]) {
    listener.startListening({
      actionCreator: creator,
      effect: (action, api) => {
        const message = action.payload ?? action.error.message ?? '';
        api.dispatch(toastShown({ kind: 'error', messageKey: 'error', values: { message } }));
      },
    });
  }

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
