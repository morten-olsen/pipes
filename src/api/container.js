import express from 'express';
import log from 'log';
import configManager from 'configmanager';

const app = express();

app.get('/', async (request, response) => {
  log.info(`Serving status for ${request.dockerHost.hostname}`);
  response.json({
    identifier: request.dockerHost.hostname,
    type: request.dockerHost.type,
    containerId: await request.dockerHost.getContainerId(),
    state: await request.dockerHost.getState(),
    pullStatus: request.dockerHost.pullStatus,
    config: await configManager.get(request.dockerHost, false),
    repoConfig: await configManager.getDefaultConfig(request.dockerHost, false),
  });
});

app.put('/config', async (request, response) => {
  configManager.set(request.dockerHost, request.body);
  await request.dockerHost.start();
});

app.delete('/config', async (request, response) => {
  configManager.remove(request.dockerHost);
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