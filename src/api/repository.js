import express from 'express';
import log from 'log';
import configManager from 'configmanager';

const app = express();

app.get('/config', async (request, response) => {
  response.json({
    config: await configManager.getDefaultConfig(request.dockerHost.image),
  });
});

app.put('/config', async (request, response) => {
  await configManager.setDefault(request.dockerHost, request.body);
});

export default app;