import { ApiError } from '../exceptions/api-error';

export async function errorHandler (err, req, res, next) {
  console.log(err + "Это оно");
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ message: err.message, errors: err.errors });
  }
  return res.status(500).json({ message: 'Непредвиденная ошибка' });
};
