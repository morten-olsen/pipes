import path from 'path';
import uuid from 'uuid';

const secret = process.env.SECRET || uuid.v4();

class Config {
  get configPath() {
    return process.env.CONFIG_PATH || '/configs';
  }

  get hasMasterPassword() {
    return !!process.env.MASTER_PASSWORD;
  }

  get masterPassword() {
    return process.env.MASTER_PASSWORD;
  }

  get domainLevels() {
    return parseInt(process.env.DOMAINLEVELS || '2', 10);
  }

  get ttl() {
    return parseInt(process.env.TTL || '15', 10);
  }

  get secret() {
    return secret;
  }

  get authTokenName() {
    return process.env.AUTH_TOKEN_NAME || 'authtoken';
  }

  get authPath() {
    return process.env.AUTH_PATH || '__auth';
  }

  get proxyApiPath() {
    return process.env.PROXY_API_PATH || '__proxyapi';
  }

  get dockerConfig() {
    if (process.env.DOCKER_HOST) {
      return {
        host: process.env.DOCKER_HOST,
        host: process.env.DOCKER_PORT || 3000,
      }
    } else if (process.env.DOCKER_SOCKET) {
      return {
        socketPath: process.env.DOCKER_SOCKET,
      }
    } else {
      return undefined;
    }
  }

  get aliases() {
    return (process.env.ALIASES || '').split(';').reduce((output, current) => {
      const parts = current.split('=');
      output[parts[0]] = parts[1];
      return output;
    }, {});
  }

  inflate(text) {
    const aliases = this.aliases;
    if (aliases[text]) {
      return aliases[text];
    }
    return text;
  };

  get dockerAuth() {
    if (process.env.DOCKER_AUTH !== 'true') {
      return undefined;
    }
    return {
      username: process.env.DOCKER_AUTH_USERNAME,
      password: process.env.DOCKER_AUTH_PASSWORD,
      email: process.env.DOCKER_AUTH_EMAIL,
      auth: '',
      serveraddress: process.env.DOCKER_AUTH_SERVER || 'https://index.docker.io/v1',
    };
  }
}

export default new Config();