import http from 'http';
import log from 'log';
import hostManager from 'hostmanager';

class Proxy {
  middleware() {
    return async (request, response, next) => {
      try {
        const hostname = request.headers.host;
        const host = hostManager.get(hostname);
        const state = await host.getState();
        if (state === 'running') {
          host.proxy(request, response, next);
        } else if (state === 'pulling') {
          response.json({
            state: 'pulling',
          });
        } else if (request.session.hasScope('request_proxy')) {
          await host.start();
          const id = await host.getContainerId();
          response.json({
            state: await host.getState(),
            id,
          });
        } else {
          response.json('Not exisiting');
        }
      } catch (err) {
        log.error(err);
      }
    };
  }
}

export default Proxy;