import express from 'express';
import log from 'log';
import Proxy from 'proxy';
import api from 'api';

const port = process.env.PORT || 3005;
const app = express();
const proxy = new Proxy();

app.use('/_proxy_config', api);
app.use(proxy.middleware());

app.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  log.error('Caught exception: ' + err);
});