import config from 'config';
import path from 'path';
import fs from 'fs-extra';

class ConfigManager {
  cache = {};
  async getDefaultConfig(host, save = true) {
    const configPath = path.join(config.configPath, 'base', host.user + '_' + host.image);
    let result = {
      port: 80,
      env: [],
      ttl: config.ttl,
    };
    if (await fs.pathExists(configPath)) {
      const raw = await fs.readFile(configPath);
      result = {
        ...result,
        ...JSON.parse(raw),
      };
    } else {
      if (save) {
        await fs.mkdirp(path.join(config.configPath, 'base'));
        await fs.writeFile(configPath, JSON.stringify(result, null, '  '), 'utf-8');
      }
    }
    return result;
  }

  async get(host, save = true) {
    if (this.cache[host.hostname]) {
      return cache[host.hostname];
    }
    let result;
    const configName = host.hostname;
    const configPath = path.join(config.configPath, 'host', configName);
    if (await fs.pathExists(configPath)) {
      const raw = await fs.readFile(configPath);
      const json = JSON.parse(raw);
      return json;
    } else {
      result = await this.getDefaultConfig(host, save);
      result.image = result.image || (host.type === 'standalone' ? undefined : host.imageName);
      if (save) {
        await fs.mkdirp(path.join(config.configPath, 'host'));
        await fs.writeFile(configPath, JSON.stringify(result, null, '  '), 'utf-8');
      }
      this.cache[host.hostname] = result;
      return result;
    }
  }

  async setDefault(host, config) {
    const image = host.image;
    const configPath = path.join(config.configPath, 'base', image);
    await fs.mkdirp(path.join(config.configPath, 'base'));
    await fs.writeFile(configPath, JSON.stringify(config, null, '  '), 'utf-8');
  }

  async set(host, config) {
    delete this.cache[host.hostname];
    const configName = host.hostname;
    const configPath = path.join(config.configPath, 'host', configName);
    await fs.mkdirp(path.join(config.configPath, 'host'));
    await fs.writeFile(configPath, JSON.stringify(config, null, '  '), 'utf-8');
  }

  async remove(host) {
    delete this.cache[host.hostname];
    const configName = host.hostname;
    const configPath = path.join(config.configPath, 'host', configName);
    await fs.rmdir(config);
  }
}

export default new ConfigManager();