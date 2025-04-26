import { alwaysIterable, type MaybeIterable } from "./alwaysIterable.ts";

/**
 * Adjusts the volume of an waveform audio sample iterable.
 */
export function* volume(
  generator: Iterable<number, void, unknown>,
  volume: MaybeIterable<number>,
): Generator<number, void, unknown> {
  const iterator = generator[Symbol.iterator]();
  const volumeGen = alwaysIterable(volume);
  while (true) {
    const { value, done } = iterator.next();
    if (done) break;
    const { value: vol } = volumeGen.next();
    yield value * vol!;
  }
}

/**
 * Adjusts the volume of an waveform audio sample async iterable.
 */
export async function* volumeAsync(
  generator: AsyncIterable<number, void, unknown>,
  volume: MaybeIterable<number>,
): AsyncGenerator<number, void, unknown> {
  const volumeGen = alwaysIterable(volume);
  const iterator = generator[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await iterator.next();
    if (done) break;
    const { value: vol } = volumeGen.next();
    yield value * vol!;
  }
}
