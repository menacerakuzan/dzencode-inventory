'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAppDispatch } from '@/store/hooks';
import { activeTabsChanged, connectionChanged } from '@/store/slices/sessionSlice';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

/** One socket per tab: the server counts sockets and pushes the number of active tabs. */
export function useRealtime(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const socket = WS_URL ? io(WS_URL) : io();

    socket.on('connect', () => dispatch(connectionChanged(true)));
    socket.on('disconnect', () => dispatch(connectionChanged(false)));
    socket.on('sessions:count', (count: number) => dispatch(activeTabsChanged(count)));

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);
}
