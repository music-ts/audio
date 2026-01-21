/**
 * pitchShift - Generator that shifts the pitch of an input audio stream by a given ratio (or semitones).
 *
 * Uses simple resampling to shift pitch. For high quality, use a phase vocoder or granular method.
 * This implementation is simple and intended for monophonic signals.
 *
 * @param input - Iterable<number> input audio samples
 * @param ratio - Pitch shift ratio. (e.g. 2.0 = one octave up, 0.5 = one octave down)
 * @returns Iterable<number> pitch-shifted audio samples
 */
export function* pitchShift(
  input: Iterable<number>,
  ratio: number,
): Iterable<number> {
  // Convert input to an iterator
  const iterator = input[Symbol.iterator]();
  const buffer: [number, number] = [0, 0]; // [current, next]
  let bufferIndex = 0; // Absolute index of buffer[0]

  // Prime the buffer with the first two samples
  const first = iterator.next();
  if (first.done) return;
  buffer[0] = first.value;
  const second = iterator.next();
  if (second.done) {
    // Only one sample in input
    while (true) yield buffer[0];
  }
  buffer[1] = second.value;
  let pos = 0;

  while (true) {
    const i = Math.floor(pos);
    const frac = pos - i;
    // Advance buffer if needed
    while (i > bufferIndex) {
      buffer[0] = buffer[1];
      const next = iterator.next();
      if (next.done) {
        buffer[1] = 0; // Pad with zero
      } else {
        buffer[1] = next.value;
      }
      bufferIndex++;
    }
    // Linear interpolation
    const s1 = buffer[0];
    const s2 = buffer[1];
    yield s1 + (s2 - s1) * frac;
    pos += ratio;
    if (pos >= bufferIndex + 2 && buffer[1] === 0) break; // End if past input
  }
}

/**
 * Utility: Convert semitones to ratio
 * @param semitones Number of semitones to shift
 * @returns Frequency ratio
 */
export function semitonesToRatio(semitones: number): number {
  return Math.pow(2, semitones / 12);
}
