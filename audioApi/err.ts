import pa from "./ffi/mod.ts";

/**
 * Base error class for audio errors.
 */
export class AudioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Audio Error";
  }

  static parseNotNull<T>(value: T | null, msg = "Value is null"): T {
    if (value === null) {
      throw new AudioError(msg);
    }
    return value;
  }
}

/**
 * Error class for PortAudio API errors.
 */
export class PortAudioError extends AudioError {
  constructor(code: number) {
    const msg = new Deno.UnsafePointerView(
      AudioError.parseNotNull(pa.symbols.Pa_GetErrorText(code)),
    ).getCString();
    super(msg);
    this.name = "PortAudio API Error";
  }

  /**
   * Parses a PortAudio error code and throws a {@link PortAudioError} if the code is negative.
   * @param code The PortAudio error code.
   * @returns The code if it is non-negative.
   */
  static parseCode(code: number): number {
    if (code < 0) {
      throw new PortAudioError(code);
    }
    return code;
  }
}
