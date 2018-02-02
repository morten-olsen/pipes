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
    this.server = '';
    for (let i = 0; i < settings.domainLevels; i++) {
      this.server += parts.pop() + '_'; 
    }
    const s = parts.pop();
    if (s !== 's') {
      this.type = 'default';
      this.user = settings.inflate(s);
      this.image = settings.inflate(parts.pop());
      this.version = settings.inflate(parts.pop() || 'latest');
    } else {
      this.type = 'standalone';
      this.user = 'builtin';
      this.image = settings.inflate(parts.pop());
      this.version = settings.inflate(parts.pop() || 'latest');
    }
    this.docker = new Docker();
    this.pullStatus = 'done';
  }

  get hostname() {
    return `${this.server}.${this.user}.${this.image}.${this.version}`;
  }

  get imageName() {
    return `${this.user}/${this.image}:${this.version}`;
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
    } if (container && this.pullStatus !== 'pulling') {
      return 'stopped';
    } else if (this.pullStatus === 'pulling') {
      return 'pulling';
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

    const onFinished = async () => {
      const config = await configManager.get(this);
      const container = await this.docker.createContainer({
        Image: config.image,
        Labels: {
          hostname: this.hostname,
          controller: 'pipes',
        },
        Env: config.env,
      });
      /* container.attach({ stream: true, stdout: true, stderr: true }, (err, stream) => {
        stream.pipe(process.stdout);
      }); */
      await container.start();
      this.pullStatus = 'done';
    };

    const onProgress = async (evt) => {
    };

    this.docker.pull(this.imageName, { authconfig: settings.dockerAuth }, (err, stream) => {
      this.pullStatus = 'pulling';
      if (err) {
        log.error(err);
        this.pullStatus = 'failed';
      } else {
        this.docker.modem.followProgress(stream, onFinished, onProgress);
      }
    });
  }

  async proxy(request, response) {
    try {
      const config = await configManager.get(this);
      const network = await this.getNetworkConfig();
      const ip = network.IPAddress;
      const options = {
        ...url.parse(request.url),
        port: config.port || 80,
        headers: {
          ...request.headers,
        },
        method: request.method,
        agent: request.agent,
        host: ip,
      }
      const connector = http.request(options, (res) => {
        res.pipe(response, {end:true});
      });
      request.pipe(connector, {end:true});
    } catch (err) {
      log.warn(err);
    }
  }
}

export default Host;