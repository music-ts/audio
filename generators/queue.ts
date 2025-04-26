/**
 * Returns an iterable that yields values from the generators in sequence.
 * Each generator is fully consumed before moving to the next one.
 */
export function* queue<T>(
  ...generators: Iterable<T, void, unknown>[]
): Generator<T, void, unknown> {
  for (const generator of generators) {
    for (const value of generator) {
      yield value;
    }
  }
}

/**
 * Returns an async iterable that yields values from the generators in sequence.
 * Each generator is fully consumed before moving to the next one.
 */
export async function* queueAsync<T>(
  ...generators:
    (Iterable<T, void, unknown> | AsyncIterable<T, void, unknown>)[]
): AsyncGenerator<T, void, unknown> {
  for (const generator of generators) {
    for await (const value of generator) {
      yield value;
    }
  }
}
