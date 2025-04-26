/**
 * Returns an iterable that yields values from the generator in a loop.
 * If `times` is specified, it will yield the values that many times.
 * Otherwise, it will yield the values indefinitely.
 */
export function * loop<T>(
  generator: Iterable<T, void, unknown>,
  times = Infinity,
): Generator<T, void, unknown> {
  const iterator = generator[Symbol.iterator]();
  let i = 0;
  const values: T[] = [];
  let finished = false;
  while (i < times) {
    if (finished) {
      for (const value of values) {
        yield value;
      }
    }
    const { value, done } = iterator.next();
    if (done) {
      finished = true;
      i++;
      continue;
    }
    values.push(value);
    yield value;
  }
}

/**
 * Returns an async iterable that yields values from the generator in a loop.
 * If `times` is specified, it will yield the values that many times.
 * Otherwise, it will yield the values indefinitely.
 */
export async function* loopAsync<T>(
  generator: AsyncIterable<T, void, unknown>,
  times = Infinity
): AsyncGenerator<T, void, unknown> {
  const iterator = generator[Symbol.asyncIterator]();
  let i = 0;
  const values: T[] = [];
  let finished = false;
  while (i < times) {
    if (finished) {
      for (const value of values) {
        yield value;
      }
    }
    const result = await iterator.next();
    if (result.done) {
      finished = true;
      i++;
      continue;
    }
    values.push(result.value);
    yield result.value;
  }
}
