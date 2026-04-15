import type { User, UserDTO } from "../types";

export function mapUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.full_name,
  };
}
