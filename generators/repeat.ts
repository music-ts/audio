/**
 * Returns an iterable that yields the same value repeatedly.
 * If `times` is specified, it will yield the value that many times.
 * Otherwise, it will yield the value indefinitely.
 */
export function* repeat<T>(
  value: T,
  times = Infinity,
): Generator<T, void, unknown> {
  let i = 0;
  while (i < times) {
    yield value;
    i++;
  }
}

/**
 * Returns an async iterable that yields the same value repeatedly.
 * If `times` is specified, it will yield the value that many times.
 * Otherwise, it will yield the value indefinitely.
 */
export async function* repeatAsync<T>(
  value: T,
  times = Infinity,
): AsyncGenerator<T, void, unknown> {
  let i = 0;
  while (i < times) {
    yield value;
    i++;
  }
}
