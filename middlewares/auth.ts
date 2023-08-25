import { ApiError } from './../exceptions/api-error';
import { validateAccessToken } from './../services/token-service';

export async function checkHeader(request, response, next) {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    return next(ApiError.UnauthorizedError);
  }
  const accessToken = authorizationHeader.split(' ')[1];
  if (!accessToken) {
    return next(ApiError.UnauthorizedError);
  }
  const userData = validateAccessToken(accessToken);
  if (!userData) {
    return next(ApiError.UnauthorizedError);
  }

  request.user = userData;
  next();
}
