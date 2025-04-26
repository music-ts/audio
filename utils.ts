export function lerp(
  start: number,
  end: number,
  t: number,
): number {
  return start + (end - start) * t;
}

export function rlerp(
  start: number,
  end: number,
  t: number,
): number {
  return (t - start) / (end - start);
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isPowerOf2(n: number): boolean {
  if (n === 2) return true;
  if (n < 2) return false;
  return isPowerOf2(n / 2);
}
