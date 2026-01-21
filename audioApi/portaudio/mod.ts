import { AudioError } from "../err.ts";
import { libSuffix } from "./utils.ts";
import type { symbols } from "./symbols.ts";

export type * from "./symbols.ts";

/**
 * Downloads the PortAudio library from GitHub.
 * @returns The PortAudio library as an ArrayBuffer.
 */
export async function installPortAudioLib(toFile: string | URL): Promise<void> {
  const url =
    `https://github.com/music-ts/audio/raw/refs/heads/main/bin/libportaudio${libSuffix()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new AudioError(
      `Failed to download audio library: ${response.statusText}`,
    );
  }
  const data = await response.arrayBuffer();
  await Deno.writeFile(toFile, new Uint8Array(data));
}

export type PortAudioLib = Deno.DynamicLibrary<typeof symbols>;
