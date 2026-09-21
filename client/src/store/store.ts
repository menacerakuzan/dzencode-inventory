import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { writeStoredFilters } from '@/lib/storage';
import orders from './slices/ordersSlice';
import products, { specificationFilterChanged, typeFilterChanged } from './slices/productsSlice';
import session from './slices/sessionSlice';
import ui from './slices/uiSlice';

export const rootReducer = combineReducers({ orders, products, session, ui });
export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware<RootState>();

  // Web Storage: remember the product filters between visits.
  listener.startListening({
    matcher: isAnyOf(typeFilterChanged, specificationFilterChanged),
    effect: (_action, api) => writeStoredFilters(api.getState().products.filters),
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
