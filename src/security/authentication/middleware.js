import express from 'express';
import Session from './session';
import User from './user';
import config from 'config';
import log from 'log';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

app.use(async (request, response, next) => {
  const headerToken = request.headers[config.authTokenName];
  const queryToken = request.query[config.authTokenName];
  const cookieToken = request.cookies[config.authTokenName];
  const token = headerToken || queryToken || cookieToken;
  try {
    request.session = await Session.getFromToken(token);
  } catch (err) {
    log.warn(err);
  }
  next();
});

app.get(`/${config.authPath}`, (request, response) => {
  if (request.session) {
    response.render('profile', {
      scopes: request.session.scopes,
      userId: request.session.userId,
    });
  } else {
    response.render('login');
  }
});

app.post(`/${config.authPath}`, async (request, response) => {
  try {
    const { id, passphrase, scopes: scopesRaw = ''} = request.body;
    const scopes = scopesRaw.split(',');
    const user = await User.getFromId(id);
    if (!user) {
      throw Error('unauthorized');
    }
    const usesMasterPassword = config.hasMasterPassword && config.masterPassword === passphrase;
    if (!usesMasterPassword && !await user.verifyPassphrase(passphrase)) {
      throw Error('unauthorized');
    }
    if (!await user.verifyScopes(scopes)) {
      throw Error('not enough rights');
    }
    const session = await Session.create(user.id, scopes);
    response.cookie(config.authTokenName, session, { maxAge: 900000, httpOnly: true });
    response.render('loggedin');
  } catch (err) {
    setTimeout(() => {
      response.render('login');
    }, Math.random() * 500 + 500);
  }
});

export default app;