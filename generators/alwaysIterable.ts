import { repeat } from "./repeat.ts";
import { repeatLastWhenDone } from "./repeatLastWhenDone.ts";

/**
 * A value that can be either a single value or an iterable of values.
 */
export type MaybeIterable<T> = T | Iterable<T, void, unknown>;

/**
 * Returns an iterable that always yields the provided values.
 * If the value is iterable, it will yield its values and repeat the last one when done.
 * If the value is not iterable, it will yield the same value repeatedly.
 */
export function alwaysIterable<T>(
  values: MaybeIterable<T>,
): Generator<T, void, unknown> {
  const isIterable = typeof values === "object" &&
    values !== null &&
    typeof (values as IterableIterator<T>)[Symbol.iterator] === "function" &&
    typeof (values as IterableIterator<T>).next === "function";
  return isIterable
    ? repeatLastWhenDone(values as IterableIterator<T>)
    : repeat(values as T);
}
