import Docker from 'dockerode';
import url from 'url';
import http from 'http';
import log from 'log';
import settings from 'config';
import configManager from 'configmanager';

class Host {
  constructor(hostname) {
    const port = hostname.substring(hostname.indexOf(':') + 1) || '80';
    this.port = parseInt(port, 10);
    const host = hostname.substring(0, hostname.indexOf(':'));
    const parts = host.split('.');
    parts.pop(); // Remove this, only used for simpler DNS setup in test
    this.tld = parts.pop();
    this.server = parts.pop();
    this.image = parts.pop();
    this.version = parts.pop() || 'latest';
    this.docker = new Docker();
  }

  get hostname() {
    return `${this.tld}.${this.server}.${this.image}.${this.version}`;
  }

  get imageName() {
    return `${settings.hubUser}/${this.image}:${this.version}`;
  }

  async getContainer() {
    const containers = await this.docker.listContainers({ all: true });
    const container = containers.find(c => (c.Labels || {}).hostname === this.hostname);
    return container;
  }

  async getContainerId() {
    const container = await this.getContainer();
    return container ? container.Id : undefined;
  }

  async getNetworkConfig() {
    const container = await this.getContainer();
    return container.NetworkSettings.Networks.bridge;
  }

  async getState() {
    const container = await this.getContainer();
    if (container && container.State === 'running') {
      return 'running';
    } if (container) {
      return 'stopped';
    } else {
      return 'missing';
    }
  }

  async clear() {
    const containers = await this.docker.listContainers({ all: true });
    const self = containers.filter(c => (c.Labels || {}).hostname === this.hostname);
    Promise.all(self.map(async (containerInfo) => {
      const container = await this.docker.getContainer(containerInfo.Id);
      if (containerInfo.State === 'running') {
        await container.stop();
      }
      await container.remove();
    }));
  }

  async start() {
    await this.clear();
    await this.docker.pull(this.imageName, { authconfig: settings.dockerAuth });
    const config = await configManager.get(this);
    const container = await this.docker.createContainer({
      Image: this.imageName,
      Labels: {
        hostname: this.hostname,
      },
      Env: config.Env,
    });
    container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
      stream.pipe(process.stdout);
    });
    await container.start();
    return container;
  }

  async proxy(request, response) {
    try {
      const network = await this.getNetworkConfig();
      const ip = network.IPAddress;
      const options = {
        ...url.parse(request.url),
        port: 80,
        headers: {
          ...request.headers,
        },
        method: request.method,
        agent: request.agent,
        host: ip,
      }
      
      console.log('request')
      const connector = http.request(options, (res) => {
        console.log('234243')
        res.pipe(response, {end:true});
      });
      request.pipe(connector, {end:true});
    } catch (err) {
      log.warn(err);
    }
  }
}

export default Host;