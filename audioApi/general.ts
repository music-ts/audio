import pa from "./ffi/mod.ts";
import { AudioError, PortAudioError } from "./err.ts";

let usage = 0;

/**
 * Initializes PortAudio. Allows getting {@link AudioHostApi}s, {@link AudioDevice}s and opening {@link AudioStream}s.
 */
export function initialize() {
  if (usage === 0) {
    PortAudioError.parseCode(pa.symbols.Pa_Initialize());
    usage++;
    console.log("PortAudio initialized");
  }
}

/**
 * Terminates PortAudio.
 */
export function terminate() {
  if (usage < 1) return;
  if (usage === 1) {
    PortAudioError.parseCode(pa.symbols.Pa_Terminate());
    console.log("PortAudio terminated");
    usage--;
  }
}

/**
 * A wrapper function that ensures PortAudio is initialized and terminated.
 *
 * @param fn The function to wrap.
 * @returns A function that returns a tuple of [error, result].
 */
export function audioTask<A extends unknown[], R>(
  fn: (...args: A) => Promise<R> | R,
): (...args: A) => Promise<[AudioError, undefined] | [undefined, R]> {
  return async (...args) => {
    let err: AudioError | undefined;
    let res: R | undefined;
    try {
      initialize();
      try {
        res = await fn(...args);
      } catch (error) {
        err = error as AudioError;
      }
      terminate();
    } catch (error) {
      err = error as AudioError;
    }
    return [err, res] as [AudioError, undefined] | [undefined, R];
  };
}

/**
 * Returns the version of the PortAudio library.
 */
export function audioApiVersion(): string {
  const pointer = AudioError.parseNotNull(pa.symbols.Pa_GetVersionText());
  return new Deno.UnsafePointerView(pointer).getCString();
}
