import { AudioError } from "../err.ts";
import { libSuffix } from "./utils.ts";

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
