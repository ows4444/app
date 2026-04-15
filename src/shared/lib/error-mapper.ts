import { ApiError } from "./errors";

export function mapError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Unauthorized";
    if (error.status === 500) return "Server error";
  }

  return "Something went wrong";
}
