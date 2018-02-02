import express from 'express';
import http from 'http';
import apiSecurity from 'security/api';
import hostManager from 'hostmanager';
import bodyParser from 'body-parser';

import container from './container';
import repository from './repository';

const app = express();

app.use(apiSecurity);
app.use(bodyParser.json());

app.use((request, response, next) => {
  const hostname = request.headers.host;
  const host = hostManager.get(hostname);
  request.dockerHost = host;
  next();
});

app.use('/container', container);
app.use('/repository', repository);

app.use((request, response) => {
  response.json('Not found');
});

export default app;