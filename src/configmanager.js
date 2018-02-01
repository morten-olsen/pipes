import config from 'config';
import path from 'path';
import fs from 'fs-extra';

class ConfigManager {
  async getDefaultConfig(image) {
    const configPath = path.join(config.configPath, 'base', image);
    if (await fs.pathExists(configPath)) {
      const raw = await fs.readFile(configPath);
      const json = JSON.parse(raw);
      return json;
    };
    return {
      Env: [],
    };
  }

  async get(host) {
    let result;
    const configName = host.hostname;
    const configPath = path.join(config.configPath, 'host', configName);
    if (await fs.pathExists(configPath)) {
      const raw = await fs.readFile(configPath);
      const json = JSON.parse(raw);
      return json;
    } else {
      result = this.getDefaultConfig(host.image);
      await fs.mkdirp(path.join(config.configPath, 'host'));
      await fs.writeFile(configPath, JSON.stringify(result, null, '  '), 'utf-8');
      return result;
    }
  }
}

export default new ConfigManager();