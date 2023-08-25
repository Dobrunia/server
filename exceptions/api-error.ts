export class ApiError extends Error {
  status: string;
  errors: string[];
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, 'User is not authorozed');
  }
}
