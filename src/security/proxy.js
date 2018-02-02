import config from 'config';

export default async (request, response, next) => {
  if (request.session && request.session.hasScope('request_proxy')) {
    next();
  } else {
    response.redirect(`/${config.authPath}`);
  }
};
