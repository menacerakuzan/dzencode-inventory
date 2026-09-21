import type { Server } from 'socket.io';

export const SESSIONS_EVENT = 'sessions:count';

/** Every open browser tab holds one socket, so the namespace size equals the number of active tabs. */
export function registerSessionCounter(io: Server): void {
  const broadcast = () => io.emit(SESSIONS_EVENT, io.of('/').sockets.size);

  io.on('connection', (socket) => {
    broadcast();
    socket.on('disconnect', broadcast);
  });
}
