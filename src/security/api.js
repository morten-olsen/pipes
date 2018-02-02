export default async (request, response, next) => {
  if (request.session && request.session.hasScope('request_api')) {
    next();
  } else {
    response.statusCode = 401;
    response.json('Unauthorized');
  }
};
