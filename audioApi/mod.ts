/**
 * Exposes the main audio API for device enumeration, stream management, and hardware access.
 *
 * @module audioApi
 */

import {
  DEFAULT_CHANNELS,
  DEFAULT_FRAMES_PER_BUFFER,
  DEFAULT_SAMPLE_FORMAT,
  DEFAULT_SAMPLE_RATE,
} from "../const.ts";
import type { AudioSampleFormat } from "../sampleFormats.ts";
import { AudioError, PortAudioError } from "./err.ts";
import { AudioDevice, AudioHostApi } from "./hardware/mod.ts";
import { installPortAudioLib } from "./portaudio/install.ts";
import type { PortAudioLib } from "./portaudio/mod.ts";
import { symbols } from "./portaudio/symbols.ts";
import { libSuffix } from "./portaudio/utils.ts";
import {
  AudioInputStream,
  AudioOutputStream,
  type StreamOptions,
} from "./stream/mod.ts";

export * from "./hardware/mod.ts";
export * from "./portaudio/mod.ts";
export * from "./stream/mod.ts";
export * from "./err.ts";

export async function initAudioApi(
  binPath: string | URL = `./libportaudio${libSuffix()}`,
): Promise<AudioApi> {
  try {
    await Deno.lstat(binPath);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
    await installPortAudioLib(binPath);
  }
  return new AudioApi(binPath);
}

export class AudioApi {
  public readonly _lib: PortAudioLib;
  constructor(binPath: string | URL) {
    this._lib = Deno.dlopen(binPath, symbols);
    PortAudioError.parseCode(this, this._lib.symbols.Pa_Initialize());
  }

  [Symbol.dispose]() {
    PortAudioError.parseCode(this, this._lib.symbols.Pa_Terminate());
    this._lib.close();
  }

  version(): string {
    const pointer = AudioError.parseNotNull(
      this._lib.symbols.Pa_GetVersionText(),
    );
    return new Deno.UnsafePointerView(pointer).getCString();
  }

  /**
   * Yields all available {@link AudioDevice}s.
   */
  *getDevices(): Generator<AudioDevice> {
    const deviceCount = this._lib.symbols.Pa_GetDeviceCount();
    for (let i = 0; i < deviceCount; i++) {
      yield new AudioDevice(this, i);
    }
  }

  /**
   * Returns the default input {@link AudioDevice}.
   */
  defaultInputDevice(): AudioDevice {
    return new AudioDevice(this, this._lib.symbols.Pa_GetDefaultInputDevice());
  }

  /**
   * Returns the default output {@link AudioDevice}.
   */
  defaultOutputDevice(): AudioDevice {
    return new AudioDevice(this, this._lib.symbols.Pa_GetDefaultOutputDevice());
  }

  /**
   * Yields all available {@link AudioHostApi}s.
   */
  *getHostApis(): Generator<AudioHostApi> {
    const hostApiCount = this._lib.symbols.Pa_GetHostApiCount();
    for (let i = 0; i < hostApiCount; i++) {
      yield new AudioHostApi(this, i);
    }
  }

  /**
   * Returns the default {@link AudioHostApi}.
   */
  defaultHostApi(): AudioHostApi {
    return new AudioHostApi(this, this._lib.symbols.Pa_GetDefaultHostApi());
  }

  /**
   * Opens an input audio stream for recording from the specified device.
   * @param options Stream options.
   * @returns An {@link AudioInputStream} for recording.
   */
  record<
    TFormat extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT,
  >({
    device = this.defaultInputDevice(),
    channels = DEFAULT_CHANNELS,
    sampleFormat = DEFAULT_SAMPLE_FORMAT as TFormat,
    suggestedLatency = device.defaultLowInputLatency,
    sampleRate = DEFAULT_SAMPLE_RATE,
    framesPerBuffer = DEFAULT_FRAMES_PER_BUFFER,
  }: Partial<StreamOptions<TFormat>> = {}): AudioInputStream<TFormat> {
    return new AudioInputStream(this, {
      device,
      channels,
      sampleFormat,
      suggestedLatency,
      sampleRate,
      framesPerBuffer,
    });
  }

  /**
   * Opens an output audio stream for playback to the specified or default output device.
   * @param options Stream options.
   * @returns An {@link AudioOutputStream} for playback.
   */
  play<
    TFormat extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT,
  >({
    device = this.defaultOutputDevice(),
    channels = DEFAULT_CHANNELS,
    sampleFormat = DEFAULT_SAMPLE_FORMAT as TFormat,
    suggestedLatency = device.defaultLowOutputLatency,
    sampleRate = DEFAULT_SAMPLE_RATE,
    framesPerBuffer = DEFAULT_FRAMES_PER_BUFFER,
  }: Partial<StreamOptions<TFormat>> = {}): AudioOutputStream<TFormat> {
    return new AudioOutputStream(this, {
      device,
      channels,
      sampleFormat,
      suggestedLatency,
      sampleRate,
      framesPerBuffer,
    });
  }
}
