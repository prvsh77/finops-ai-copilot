export class ApiError extends Error {
  constructor(status, code, message, details = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function validationError(details) {
  return new ApiError(400, "VALIDATION_ERROR", "The request was invalid.", details);
}

export function unauthorized(message = "Authentication is required to access this resource.") {
  return new ApiError(401, "AUTHENTICATION_REQUIRED", message);
}

export function forbidden(message = "You do not have permission to perform this action.") {
  return new ApiError(403, "INSUFFICIENT_PERMISSIONS", message);
}

export function conflict(message, details = []) {
  return new ApiError(409, "RESOURCE_CONFLICT", message, details);
}

export function notFound(message = "The requested resource was not found.") {
  return new ApiError(404, "RESOURCE_NOT_FOUND", message);
}
