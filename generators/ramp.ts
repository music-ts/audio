import { lerp } from "../utils.ts";

/**
 * Generates a linear ramp between start and end values.
 * 
 * @param start - The starting value.
 * @param end - The ending value.
 * @param samples - The number of samples to generate.
 * @param curveFn - A function to apply a curve to the ramp.
 * @returns A generator that yields the ramp values.
 */
export function * ramp(
  start: number,
  end: number,
  samples: number,
  curveFn: (x: number) => number = (x) => x,
): Generator<number, void, unknown> {
  for (let i = 0; i < samples; i++) {
    const t = curveFn(i / samples);
    yield lerp(start, end, t);
  }
}
