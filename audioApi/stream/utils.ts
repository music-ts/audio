import { AUDIO_SAMPLE_FORMATS } from "../../sampleFormats.ts";
import type { StreamOptions } from "./types.ts";

export function createStreamParams({
  device,
  sampleFormat,
  channels,
  suggestedLatency,
}: Pick<StreamOptions, "device" | "sampleFormat" | "channels" | "suggestedLatency">): Deno.PointerValue {
  const buff = new ArrayBuffer(32);
  const view = new DataView(buff);
  view.setInt32(0, device.id, true);
  view.setInt32(4, channels, true);
  view.setBigUint64(
    8,
    BigInt(AUDIO_SAMPLE_FORMATS[sampleFormat].paTag),
    true,
  );
  view.setFloat64(16, suggestedLatency, true);
  return Deno.UnsafePointer.of(buff);
}
