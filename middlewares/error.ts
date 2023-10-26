import { ApiError } from '../exceptions/api-error';

export function logErrors (err, req, res, next) {
  console.error(err.stack)
  next(err)
}

export function clientErrorHandler (err, req, res, next) {
  if (err instanceof ApiError) {
    return next(res
      .status(err.status)
      .json({ message: err.message, errors: err.errors }));
  } else {
    next(err)
  }
}

export function errorHandler (err, req, res, next) {
  res.status(500)
  res.render('error', { error: err })
}
