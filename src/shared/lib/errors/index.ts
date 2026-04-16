export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export class HttpError extends AppError {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message, "HTTP_ERROR");
  }
}

export class NetworkError extends AppError {
  constructor() {
    super("Network error", "NETWORK_ERROR");
  }
}

export class TimeoutError extends AppError {
  constructor() {
    super("Request timeout", "TIMEOUT");
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super("Session expired", "SESSION_EXPIRED");
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED");
  }
}
