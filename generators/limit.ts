/**
 * Returns an iterable that yields values from the generator up to the specified size.
 * If the generator has fewer values than the size, it will yield all available values.
 */
export function* limit<T>(
  generator: Iterable<T, void, unknown>,
  size: number,
): Generator<T, void, unknown> {
  let i = 0;
  for (const value of generator) {
    if (i++ >= size) break;
    yield value;
  }
}

/**
 * Returns an async iterable that yields values from the generator up to the specified size.
 * If the generator has fewer values than the size, it will yield all available values.
 */
export async function* limitAsync<T>(
  generator: AsyncIterable<T, void, unknown>,
  size: number,
): AsyncGenerator<T, void, unknown> {
  let i = 0;
  for await (const value of generator) {
    if (i++ >= size) break;
    yield value;
  }
}
