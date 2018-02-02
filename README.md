# Pipes

A docker auto deployment server, be warned, this is WIP territory

## Setup

In order to work read-write access to a docker socket is required (will be changed to allow for TCP connections), which will have to be mounted on `/var/run/docker.sock`, so the minimal command to run `pipes` is `docker run -v "/var/run/docker.sock:/var/run/docker.sock" pipes`

### Private repositories

In order to access private repositories, authentication needs to be specified as environment files (file support for all variables are on the way), these values are:

```
DOCKER_AUTH=true
DOCKER_AUTH_USERNAME=your-username
DOCKER_AUTH_EMAIL=your-email
DOCKER_AUTH_PASSWORD=your-password
```

### Domain levels

If not specified, pipes expect to work below a two level domain, so in case of `example.com` pipes expect to be able to work with everything from `*.example.com`, in the format `{tag}.{repo}.{user}.example.com`, if the domain has more levels, as for instance `{tag}.{repo}.{user}.pipe.example.com` this can be specified using a environment variable as `DOMAINLEVELS=3`

### Persistance

All data inside the container is stored inside `/configs`, so to enable persistance, this will have to be mounted to some persistet storage `docker run -v "$PWD/configs:/configs" -v "/var/run/docker.sock:/var/run/docker.sock" pipes`

## Usage

When ever a `{tag}.{repo}.{user}.domain` url is called, pipes will see if there is a docker image running, with this image. If it finds one it will proxy calls to this container. If it is not found it will pull it and start it

## API usage

The api is located at `{tag}.{repo}.{user}.domain/__proxyapi`, and all urls displayed below will be relative to this

### Container

| Endpoint | Method | Description |
|---|---|---|
| `./container` | GET | Get the state of the container at the given url |
| `./container` | DELETE | Stops the container the container |
| `./container/config` | PUT | Replace the containers configuration and restart it |
| `./container/stop` | GET | Replace the containers configuration and restart it |
| `./container/restart` | POST | Restart the container |

### Repository

| Endpoint | Method | Description |
|---|---|---|
| `./repository/config` | GET | Get the default configuration for a repository
| `./repository/config` | PUT | Replace the default configuration for a repository

## Security

There are no security mechanisms in place yet, so this should not be run anywhere other than a trusted environment. User authentication can be added into `security/api` and `security/proxy`