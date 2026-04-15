import { cookies, headers } from "next/headers";

export function getRequestContext() {
  return {
    cookies: cookies(),
    headers: headers(),
  };
}
