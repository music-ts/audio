import type { AudioOptions, AudioSampleFormat } from "../../sampleFormats.ts";
import type { AudioDevice } from "../hardware/mod.ts";

/** @internal */
export type StreamType = "input" | "output";

export type StreamOptions<TFormat extends AudioSampleFormat = AudioSampleFormat> = {
  device: AudioDevice;
  suggestedLatency: number;
  framesPerBuffer: number;
} & AudioOptions<TFormat>

export type StreamLimitOptions = {
  hours: number,
  minutes: number,
  seconds: number,
  miliseconds: number,
  samples: number,
  chunks: number,
};