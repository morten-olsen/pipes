import User from './user';
import config from 'config';
import jwt from 'json-web-token';

class Session {
  constructor(userId, scopes) {
    this._userId = userId;
    this._scopes = scopes;
  }

  get userId() {
    return this._userId;
  }

  get scopes() {
    return this._scopes;
  }

  async getUser() {
    if (!this._user) {
      this.user = User.getFromId(this.userId)
    }
  }

  hasScope(scope) {
    return this.scopes.includes(scope);
  }

  static async create(userId, scopes = [], expires) {
    return new Promise((resolve, reject) => {
      jwt.encode(config.secret, {
        userId,
        scopes,
        expires,
      }, (err, token) => {
        if (err) {
          return reject(err);
        }
        return resolve(token);
      });
    });
  }

  static async getFromToken(token) {
    if (!token) {
      return undefined;
    }
    return new Promise((resolve, reject) => {
      jwt.decode(config.secret, token, (err, payload, headers) => {
        if (err) {
          return reject(err);
        }
        if (payload.expires < (new Date()).getTime()) {
          return reject(Error('token expired'));
        }
        const session = new Session(
          payload.userId,
          payload.scopes,
        )
        return resolve(session);
      });
    });
  }
}

export default Session;