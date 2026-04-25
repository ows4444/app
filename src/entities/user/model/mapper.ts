import { type ApiUser } from "./schema";
import { type User } from "./types";

export function mapApiUserToDomain(api: ApiUser): User {
  return {
    id: api.id,
    name: api.full_name,
  };
}
