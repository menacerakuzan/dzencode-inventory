import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Settings, User, Warehouse } from '@/types';

export interface SessionState {
  user: User | null;
  /** Number of open app tabs across all browsers, pushed by Socket.io. */
  activeTabs: number | null;
  connected: boolean;
  warehouses: Warehouse[];
  settings: Settings;
}

const initialState: SessionState = {
  user: null,
  activeTabs: null,
  connected: false,
  warehouses: [],
  settings: { currencies: [], defaultCurrency: '' },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    activeTabsChanged(state, action: PayloadAction<number>) {
      state.activeTabs = action.payload;
    },
    connectionChanged(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    warehousesHydrated(state, action: PayloadAction<Warehouse[]>) {
      state.warehouses = action.payload;
    },
  },
});

export const { activeTabsChanged, connectionChanged, warehousesHydrated } = sessionSlice.actions;
export default sessionSlice.reducer;
