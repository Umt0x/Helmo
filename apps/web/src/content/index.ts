import type { PageDef } from "./types";
import { corePages } from "./core";
import { serverPages } from "./server";

/** Pages built from data, keyed by path under /dashboard/. */
export const pages: Record<string, PageDef> = { ...corePages, ...serverPages };
