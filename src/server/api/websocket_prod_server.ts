import { createProductionContext } from './createProductionContext';
import { appRouter } from './root';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import http from 'http';
import next from 'next';
import { parse } from 'url';
import ws from 'ws';

const port = parseInt(process.env.PORT ?? '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

void app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const proto = req.headers['x-forwarded-proto'];

    if (proto && proto === 'http') {
      // redirect to ssl

        const resUrl = `https://${req.headers.host}${req.headers.url as string ?? ''}`

        res.writeHead(303, {
            location: resUrl,
        });

        res.end();

        return;
    }

    const parsedUrl = parse(req.url!, true);
    void handle(req, res, parsedUrl);
  });
  const wss = new ws.Server({ server });
  const handler = applyWSSHandler({ 
    wss, 
    router: appRouter,  
    createContext: createProductionContext
});

  process.on('SIGTERM', () => {
    console.log('SIGTERM');
    handler.broadcastReconnectNotification();
  });
  server.listen(port);

  console.log(
    `> Server listening at https://localhost:${port} as ${
      dev ? 'development' : process.env.NODE_ENV
    }`,
  );
});