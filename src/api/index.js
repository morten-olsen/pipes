import express from 'express';
import http from 'http';
import log from 'log';
import hostManager from 'hostmanager';

const app = express();

app.use((request, response, next) => {
  const hostname = request.headers.host;
  const host = hostManager.get(hostname);
  request.dockerHost = host;
  next();
});

app.get('/status', async (request, response) => {
  log.info(`Serving status for ${request.dockerHost.hostname}`);
  response.json({
    image: request.dockerHost.imageName,
    identifier: request.dockerHost.hostname,
    containerId: await request.dockerHost.getContainerId(),
    state: await request.dockerHost.getState(),
  })
});

app.get('/restart', async (request, response) => {
  await request.dockerHost.start();
  response.json('done');
});

app.get('/stop', async (request, response) => {
  await request.dockerHost.clear();
  response.json('done');
});

export default app;