import type { StreamOptions } from "../audioApi/mod.ts";
import { alwaysIterable, type MaybeIterable } from "./alwaysIterable.ts";

export type WaveSampler = (
  frequency: MaybeIterable<number>,
  { sampleRate }: Pick<StreamOptions, "sampleRate">,
) => Generator<number, void, unknown>;

function waveFactory(
  fn: (t: number) => number,
): WaveSampler {
  return function* (frequency, { sampleRate }) {
    const twoPi = 2 * Math.PI / sampleRate;
    const frequencyGenerator = alwaysIterable(frequency);
    let t = 0;
    while (true) {
      yield fn(t);
      const { value } = frequencyGenerator.next();
      t += value! * twoPi;
    }
  };
}

export const sine: WaveSampler = waveFactory(Math.sin);
export const square: WaveSampler = waveFactory((t) => Math.sign(Math.sin(t)));
export const sawtooth: WaveSampler = waveFactory((t) =>
  (t / (2 * Math.PI)) % 1
);
export const triangle: WaveSampler = waveFactory((t) =>
  Math.abs(1 - (t / Math.PI) % 2)
);
