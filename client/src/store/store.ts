import { combineReducers, configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { writeStoredTypeFilter } from '@/lib/storage';
import orders from './slices/ordersSlice';
import products, { typeFilterChanged } from './slices/productsSlice';
import session from './slices/sessionSlice';
import ui from './slices/uiSlice';

export const rootReducer = combineReducers({ orders, products, session, ui });
export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  const listener = createListenerMiddleware<RootState>();

  // Web Storage: remember the selected product type between visits.
  listener.startListening({
    actionCreator: typeFilterChanged,
    effect: (action) => writeStoredTypeFilter(action.payload),
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listener.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
