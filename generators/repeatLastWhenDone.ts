/**
 * Repeats the last yielded value when the generator is exhausted.
 *
 * @param generator - The iterable to yield values from.
 * @returns A generator that yields values from the iterable and repeats the last value when done.
 */
export function* repeatLastWhenDone<T>(
  generator: Iterable<T, void, unknown>,
): Generator<T, void, unknown> {
  let last: T;
  let hasYielded = false;
  for (const value of generator) {
    yield value;
    last = value;
    hasYielded = true;
  }
  if (!hasYielded) throw new Error("There's nothing to repeat");
  while (true) {
    yield last!;
  }
}

/**
 * Repeats the last yielded value when the generator is exhausted.
 *
 * @param generator - The async iterable to yield values from.
 * @returns An async generator that yields values from the iterable and repeats the last value when done.
 */
export async function* repeatLastWhenDoneAsync<T>(
  generator: AsyncIterable<T, void, unknown>,
): AsyncGenerator<T, void, unknown> {
  let last: T | undefined;
  let hasYielded = false;
  for await (const value of generator) {
    yield value;
    last = value;
    hasYielded = true;
  }
  if (!hasYielded) throw new Error("There's nothing to repeat");
  while (true) {
    yield last!;
  }
}
