import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config.js';
import { createMysqlRepositories, createPool, waitForDatabase } from './db/mysqlRepositories.js';
import { createSocketEventBus, registerSessionCounter } from './realtime.js';

const pool = createPool(config.db);
await waitForDatabase(pool);

const io = new Server({
  cors: { origin: config.corsOrigins, credentials: true },
});
registerSessionCounter(io);

const app = createApp({
  repos: createMysqlRepositories(pool),
  events: createSocketEventBus(io),
  corsOrigins: config.corsOrigins,
});
const httpServer = createServer(app);
io.attach(httpServer);

httpServer.listen(config.port, () => {
  console.log(`API and Socket.io server listening on http://localhost:${config.port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  io.close();
  httpServer.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
