import path from 'path';

class Config {
  get configPath() {
    return path.join(__dirname, '../configs')
  }
  get hubUser() {
    return process.env.HUB_USER || 'sampension';
  }

  get dockerAuth() {
    return {
      serveraddress: 'https://index.docker.io/v1',
    };
  }
}

export default new Config();