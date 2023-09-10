import { ApiError } from './../exceptions/api-error';
import { validateAccessToken } from './../services/token-service';

export async function checkHeader(request, response, next) {
  const authorizationHeader = request.headers.authorization;
  if (!authorizationHeader) {
    return next(ApiError.UnauthorizedError());
  }
  const accessToken = authorizationHeader.split(' ')[1];
  if (!accessToken) {
    return next(ApiError.UnauthorizedError());
  }
  try {
    const userData = validateAccessToken(accessToken);
    request.user = userData;
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
  next();
}
