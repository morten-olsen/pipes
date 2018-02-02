import path from 'path';

class Config {
  get configPath() {
    return process.env.CONFIG_PATH || '/app/configs';
  }
  get domainLevels() {
    return parseInt(process.env.DOMAINLEVELS || '2', 10);
  }

  get aliases() {
    return (process.env.ALIASES || '').split(';').reduce((output, current) => {
      const parts = current.split('=');
      console.log('test', current)
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