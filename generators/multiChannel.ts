/**
 * Combines multiple mono generators into a multi-channel generator.
 *
 * @param generators - An array of float sample generators (one per channel)
 * @returns A generator yielding arrays, each representing one frame across all channels

 * @example
 * const left = sine(440, options);
 * const right = sine(880, options);
 * const source = chunker(
 *   multiChannel(left, right),
 *   options
 * );
 * await play(options).from(source);
 */
export function* multiChannel(
  ...generators: Iterable<number>[]
): Generator<number, void, unknown> {
  const iterators = generators.map((g) => g[Symbol.iterator]());
  while (true) {
    for (const it of iterators) {
      const { value, done } = it.next();
      if (done) return;
      yield value;
    }
  }
}

/**
 * Combines multiple mono async generators into a multi-channel generator.
 *
 * @param generators - An array of float sample generators (one per channel)
 * @returns A generator yielding arrays, each representing one frame across all channels

 * @example
 * const left = sine(440, options);
 * const right = sine(880, options);
 * const source = chunker(
 *   multiChannel(left, right),
 *   options
 * );
 * await play(options).from(source);
 */
export async function* multiChannelAsync(
  ...generators:
    (AsyncIterable<number, void, unknown> | Iterable<number, void, unknown>)[]
): AsyncGenerator<number, void, unknown> {
  const iterators = generators.map((g) =>
    (
      (g as AsyncIterable<number, void, unknown>)[Symbol.asyncIterator] ||
      (g as Iterable<number, void, unknown>)[Symbol.iterator]
    )()
  );
  while (true) {
    for (const it of iterators) {
      const { value, done } = await it.next();
      if (done) return;
      yield value;
    }
  }
}
