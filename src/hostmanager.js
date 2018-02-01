import Host from 'host';

class HostManager {
  hosts = {};

  get(hostname) {
    if (!this.hosts[hostname]) {
      const host = new Host(hostname);
      this.hosts[hostname] = host;
    }
    return this.hosts[hostname];
  }
}

export default new HostManager();