export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly meta?: Record<string, unknown>,
    public readonly severity: "low" | "medium" | "high" = "medium",
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export class HttpError extends AppError {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message, "HTTP_ERROR", undefined, "medium", status >= 500);
  }
}

export class NetworkError extends AppError {
  constructor() {
    super("Network error", "NETWORK_ERROR", undefined, "high", true);
  }
}

export class TimeoutError extends AppError {
  constructor() {
    super("Request timeout", "TIMEOUT", undefined, "high", true);
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super("Session expired", "SESSION_EXPIRED", undefined, "low", false);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED", undefined, "medium", false);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", meta?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", meta, "low", false);
  }
}
