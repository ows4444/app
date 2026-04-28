type HttpErrorMeta = {
  upstream?: boolean;
  service?: string;
};

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean = false,
    public readonly meta?: Record<string, unknown>,
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
    meta?: HttpErrorMeta,
  ) {
    super(message, "HTTP_ERROR", status >= 500, meta);
  }
}
export class NetworkError extends AppError {
  constructor() {
    super("Network error", "NETWORK_ERROR");
  }
}
export class SessionExpiredError extends AppError {
  constructor() {
    super("Session expired", "SESSION_EXPIRED");
  }
}
