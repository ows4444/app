import { AppError, HttpError, NetworkError, TimeoutError, SessionExpiredError, UnauthorizedError } from "./errors";

export function mapToDomainError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof HttpError) {
    if (err.status === 401) return new SessionExpiredError();
    if (err.status === 403) return new UnauthorizedError();
    return err;
  }

  if (err instanceof DOMException && err.name === "AbortError") {
    return new TimeoutError();
  }

  return new NetworkError();
}
