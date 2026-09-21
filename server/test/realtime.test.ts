import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import { io as connect, type Socket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerSessionCounter, SESSIONS_EVENT } from '../src/realtime.js';

describe('active sessions counter', () => {
  let httpServer: HttpServer;
  let io: Server;
  let url: string;
  const clients: Socket[] = [];

  beforeEach(async () => {
    httpServer = createServer();
    io = new Server(httpServer);
    registerSessionCounter(io);
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));
    url = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    clients.splice(0).forEach((client) => client.disconnect());
    await new Promise<void>((resolve) => io.close(() => resolve()));
  });

  const openTab = () => {
    const client = connect(url, { transports: ['websocket'], forceNew: true });
    clients.push(client);
    return client;
  };

  const nextCount = (client: Socket) =>
    new Promise<number>((resolve) => client.once(SESSIONS_EVENT, resolve));

  it('broadcasts the number of connected tabs on connect and disconnect', async () => {
    const first = openTab();
    expect(await nextCount(first)).toBe(1);

    const firstSeesTwo = nextCount(first);
    const second = openTab();
    const secondSeesTwo = nextCount(second);
    expect(await firstSeesTwo).toBe(2);
    expect(await secondSeesTwo).toBe(2);

    const afterClose = nextCount(first);
    second.disconnect();
    expect(await afterClose).toBe(1);
  });
});
