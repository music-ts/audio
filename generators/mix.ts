/**
 * Combines multiple waveform audio sample iterables into a single waveform generator.
 */
export function* mix(
  ...waves: Iterable<number>[]
): Generator<number, void, unknown> {
  while (true) {
    let x = 0;
    const iterators = waves.map((w) => w[Symbol.iterator]());
    const values = iterators.map((it) => it.next());
    for (const [i, { done, value }] of values.entries()) {
      if (done) {
        waves.splice(i, 1);
      } else {
        x += value;
      }
    }
    if (waves.length === 0) break;
    yield x / values.length;
  }
}

/**
 * Combines multiple waveform audio sample (async) iterables into a single waveform generator.
 */
export async function* mixAsync(
  ...waves: (Iterable<number> | AsyncIterable<number>)[]
): AsyncGenerator<number, void, unknown> {
  const iterators = waves.map((w) =>
    (
      (w as AsyncIterable<number>)[Symbol.asyncIterator] ||
      (w as Iterable<number>)[Symbol.iterator]
    )()
  );
  while (true) {
    let x = 0;
    const results = await Promise.all(iterators.map((it) => it.next()));
    for (let i = results.length - 1; i >= 0; i--) {
      if (results[i].done) {
        iterators.splice(i, 1);
        results.splice(i, 1);
      }
    }
    if (iterators.length === 0) break;
    for (const result of results) {
      x += result.value ?? 0;
    }
    yield x / waves.length;
  }
}
