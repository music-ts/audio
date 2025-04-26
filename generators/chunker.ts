import type { StreamOptions } from "../audioApi/mod.ts";
import {
  AUDIO_SAMPLE_FORMATS,
  type AudioBuffer,
  type AudioSampleFormat,
} from "../sampleFormats.ts";
import { lerp, rlerp } from "../utils.ts";

/**
 * Returns an iterable that yields audio buffers from the float generator.
 * Each buffer is filled with values from the float generator.
 * If the float generator is exhausted, the function returns.
 */
export function* chunker<TFormat extends AudioSampleFormat>(
  floatGenerator: Iterable<number>,
  { sampleFormat, framesPerBuffer }: Pick<
    StreamOptions<TFormat>,
    "sampleFormat" | "framesPerBuffer"
  >,
): Generator<AudioBuffer<TFormat>, void, unknown> {
  const iterator = floatGenerator[Symbol.iterator]()
  const formatter = AUDIO_SAMPLE_FORMATS[sampleFormat];
  while (true) {
    const buffer = new formatter.Array(framesPerBuffer);
    for (let j = 0; j < framesPerBuffer; j++) {
      const { value, done } = iterator.next();
      if (done) return;
      buffer[j] = lerp(
        formatter.minValue,
        formatter.maxValue,
        rlerp(-1, 1, value),
      );
    }
    yield buffer as AudioBuffer<TFormat>;
  }
}

/**
 * Returns an async iterable that yields audio buffers from the float generator.
 * Each buffer is filled with values from the float generator.
 * If the float generator is exhausted, the function returns.
 */
export async function* chunkerAsync<TFormat extends AudioSampleFormat>(
  floatGenerator: Iterable<number> | AsyncIterable<number>,
  { sampleFormat, framesPerBuffer }: Pick<
    StreamOptions<TFormat>,
    "sampleFormat" | "framesPerBuffer"
  >,
): AsyncGenerator<AudioBuffer<TFormat>, void, unknown> {
  const iterator = (
    (floatGenerator as AsyncIterable<number>)[Symbol.asyncIterator]
    || (floatGenerator as Iterable<number>)[Symbol.iterator]
  )();
  const formatter = AUDIO_SAMPLE_FORMATS[sampleFormat];
  while (true) {
    const buffer = new formatter.Array(framesPerBuffer);
    for (let j = 0; j < framesPerBuffer; j++) {
      const result = await iterator.next();
      if (result.done) return;
      buffer[j] = lerp(
        formatter.minValue,
        formatter.maxValue,
        rlerp(-1, 1, result.value),
      );
    }
    yield buffer as AudioBuffer<TFormat>;
  }
}
