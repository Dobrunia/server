import { ApiError } from '../exceptions/api-error.js';

export async function verifyAccount(request, response, next) {
  try {
    if (request.user.id !== request.userId)
      return next(ApiError.UnauthorizedError());
    next(request);
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
  next();
}
