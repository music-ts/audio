import pa from "../ffi/mod.ts"
import { AudioError } from "../err.ts";
import { unsafeString } from "../ffi/utils.ts";
import { AudioDevice } from "./device.ts";

/**
 * Yields all available {@link AudioHostApi}s.
 */
export function* getHostApis(): Generator<AudioHostApi> {
  const hostApiCount = pa.symbols.Pa_GetHostApiCount();
  for (let i = 0; i < hostApiCount; i++) {
    yield new AudioHostApi(i);
  }
}

/**
 * Returns the default {@link AudioHostApi}.
 */
export function defaultHostApi(): AudioHostApi {
  return new AudioHostApi(pa.symbols.Pa_GetDefaultHostApi());
}

/**
 * Represents a host API and provides access to its properties and device information.
 */
export class AudioHostApi {

  private _pw: Deno.UnsafePointerView

  constructor(public readonly id: number) {
    const hostApiInfoPointer = AudioError.parseNotNull(
      pa.symbols.Pa_GetHostApiInfo(id),
      `Failed to get host API info for host API index ${id}`,
    );
    this._pw = new Deno.UnsafePointerView(hostApiInfoPointer)
    if (this._structVersion !== 1) {
      throw new AudioError(`Unsupported host API struct version: ${this._structVersion}`);
    }
  }

  private get _structVersion() { return this._pw.getInt32(0); }

  /**
   * The well known unique identifier of this host API
   */
  get hostType(): number { return this._pw.getInt32(4); }

  /**
   * A textual description of the host API for display on user interfaces. Encoded as UTF-8.
   */
  get name(): string { return unsafeString(this._pw.getBigInt64(8)); }

  /**
   * Yields all {@link AudioDevice}s belonging to this host API.
   */
  *devices(): Generator<AudioDevice> { 
    const numDevices = this._pw.getInt32(16);
    for (let i = 0; i < numDevices; i++) {
      const id = pa.symbols.Pa_HostApiDeviceIndexToDeviceIndex(this.id, i);
      yield new AudioDevice(id);
    }
  }

  /**
   * Returns the default input {@link AudioDevice} for this host API.
   */
  get defaultInputDevice(): AudioDevice { 
    const id = this._pw.getInt32(20); 
    return new AudioDevice(id);
  }

  /**
   * Returns the default output {@link AudioDevice} for this host API.
   */
  get defaultOutputDevice(): AudioDevice { 
    const id = this._pw.getInt32(24); 
    return new AudioDevice(id);
  }

}
