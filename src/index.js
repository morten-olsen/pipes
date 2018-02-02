require('dotenv').config();
import 'babel-polyfill';
import express from 'express';
import log from 'log';
import config from 'config';
import Proxy from 'proxy';
import proxySecurity from 'security/proxy';
import api from 'api';
import authentication from 'security/authentication/middleware';
import cookieParser from 'cookie-parser';

const port = process.env.PORT || 3005;
const app = express();
const proxy = new Proxy();

app.use(cookieParser(config.secret));
app.use(authentication);
app.use(`/${config.proxyApiPath}`, api);

app.use(proxySecurity);
app.use(proxy.middleware());

app.listen(port, () => {
  log.info(`Server is running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  log.error(err);
});