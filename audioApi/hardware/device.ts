import type { DEFAULT_SAMPLE_FORMAT } from "../../const.ts";
import pa from "../ffi/mod.ts"
import { AudioError } from '../err.ts';
import { unsafeString } from "../ffi/utils.ts";
import {
  type AudioInputStream,
  type AudioOutputStream,
  type StreamOptions,
  play,
  record,
} from "../stream/mod.ts";
import { AudioHostApi } from "./hostApi.ts";
import type { AudioSampleFormat } from "../../sampleFormats.ts";

/**
 * Yields all available {@link AudioDevice}s.
 */
export function* getDevices(): Generator<AudioDevice> {
  const deviceCount = pa.symbols.Pa_GetDeviceCount();
  for (let i = 0; i < deviceCount; i++) {
    yield new AudioDevice(i);
  }
}

/**
 * Returns the default input {@link AudioDevice}.
 */
export function defaultInputDevice(): AudioDevice {
  return new AudioDevice(pa.symbols.Pa_GetDefaultInputDevice());
}

/**
 * Returns the default output {@link AudioDevice}.
 */
export function defaultOutputDevice(): AudioDevice {
  return new AudioDevice(pa.symbols.Pa_GetDefaultOutputDevice());
}

/**
 * Represents an audio device and provides access to its properties and stream creation methods.
 */
export class AudioDevice {
  private _pw: Deno.UnsafePointerView

  /**
   * Creates a new AudioDevice instance for the given device ID.
   * @param id The device index/id. Must be >= 0.
   * @throws If the device is not available or the device info cannot be retrieved.
   */
  constructor(public readonly id: number) {
    if (id < 0) {
      throw new AudioError('Device not available');
    }
    const deviceInfoPointer = AudioError.parseNotNull(
      pa.symbols.Pa_GetDeviceInfo(id),
      `Failed to get device info for device index ${id}`,
    );
    this._pw = new Deno.UnsafePointerView(deviceInfoPointer)
  }

  /**
   * Gets the struct version of the device info structure.
   * @returns The struct version as a number.
   */
  get structVersion(): number { return this._pw.getInt32(0); }

  /**
   * Gets the name of the audio device.
   * @returns The device name as a string.
   */
  get name(): string { return unsafeString(this._pw.getBigInt64(8)); }

  /**
   * Gets the host API associated with this device.
   * @returns An {@link AudioHostApi} instance for the host API.
   */
  get hostApi(): AudioHostApi {
    const i = this._pw.getInt32(16);
    return new AudioHostApi(i);
  }

  /**
   * Gets the maximum number of input channels supported by this device.
   * @returns The maximum input channels.
   */
  get maxInputChannels(): number { return this._pw.getInt32(20); }

  /**
   * Gets the maximum number of output channels supported by this device.
   * @returns The maximum output channels.
   */
  get maxOutputChannels(): number { return this._pw.getInt32(24); }

  /**
   * Gets the default low input latency for this device (in seconds).
   * @returns The default low input latency.
   */
  get defaultLowInputLatency(): number { return this._pw.getFloat64(28); }

  /**
   * Gets the default low output latency for this device (in seconds).
   * @returns The default low output latency.
   */
  get defaultLowOutputLatency(): number { return this._pw.getFloat64(36); }

  /**
   * Gets the default high input latency for this device (in seconds).
   * @returns The default high input latency.
   */
  get defaultHighInputLatency(): number { return this._pw.getFloat64(44); }

  /**
   * Gets the default high output latency for this device (in seconds).
   * @returns The default high output latency.
   */
  get defaultHighOutputLatency(): number { return this._pw.getFloat64(52); }

  /**
   * Gets the default sample rate for this device (in Hz).
   * @returns The default sample rate.
   */
  get defaultSampleRate(): number { return this._pw.getFloat64(60); }

  /**
   * Opens an input audio stream for recording from this device.
   * @typeParam T - The audio sample format.
   * @param options - Optional stream options (except device, which is set automatically).
   * @returns An {@link AudioInputStream} for recording.
   */
  record<T extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT>(
    options: Partial<Omit<StreamOptions<T>, "device">> = {}
  ): AudioInputStream<T> {
    return record({
      device: this,
      ...options,
    });
  }

  /**
   * Opens an output audio stream for playback to this device.
   * @typeParam T - The audio sample format.
   * @param options - Optional stream options (except device, which is set automatically).
   * @returns An {@link AudioOutputStream} for playback.
   */
  play<T extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT>(
    options: Partial<Omit<StreamOptions<T>, "device">> = {}
  ): AudioOutputStream<T> {
    return play({
      device: this,
      ...options,
    });
  }

}
