import { createContext } from "react";

import { type Messages } from "./types";

export const I18nContext = createContext<Messages | null>(null);
