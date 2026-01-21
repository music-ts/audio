import type { symbols } from "./symbols.ts";

export type * from "./symbols.ts";

export type PortAudioLib = Deno.DynamicLibrary<typeof symbols>;