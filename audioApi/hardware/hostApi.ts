import { AudioError } from "../err.ts";
import type { AudioApi } from "../mod.ts";
import { unsafeString } from "../portaudio/utils.ts";
import { AudioDevice } from "./device.ts";

/**
 * Represents a host API and provides access to its properties and device information.
 */
export class AudioHostApi {
  private _pw: Deno.UnsafePointerView;

  constructor(
    private readonly _api: AudioApi,
    public readonly id: number,
  ) {
    const hostApiInfoPointer = AudioError.parseNotNull(
      this._api._lib.symbols.Pa_GetHostApiInfo(id),
      `Failed to get host API info for host API index ${id}`,
    );
    this._pw = new Deno.UnsafePointerView(hostApiInfoPointer);
    if (this._structVersion !== 1) {
      throw new AudioError(
        `Unsupported host API struct version: ${this._structVersion}`,
      );
    }
  }

  private get _structVersion() {
    return this._pw.getInt32(0);
  }

  /**
   * The well known unique identifier of this host API
   */
  get hostType(): number {
    return this._pw.getInt32(4);
  }

  /**
   * A textual description of the host API for display on user interfaces. Encoded as UTF-8.
   */
  get name(): string {
    return unsafeString(this._pw.getBigInt64(8));
  }

  /**
   * Yields all {@link AudioDevice}s belonging to this host API.
   */
  *devices(): Generator<AudioDevice> {
    const numDevices = this._pw.getInt32(16);
    for (let i = 0; i < numDevices; i++) {
      const id = this._api._lib.symbols.Pa_HostApiDeviceIndexToDeviceIndex(
        this.id,
        i,
      );
      yield new AudioDevice(this._api, id);
    }
  }

  /**
   * Returns the default input {@link AudioDevice} for this host API.
   */
  get defaultInputDevice(): AudioDevice {
    const id = this._pw.getInt32(20);
    return new AudioDevice(this._api, id);
  }

  /**
   * Returns the default output {@link AudioDevice} for this host API.
   */
  get defaultOutputDevice(): AudioDevice {
    const id = this._pw.getInt32(24);
    return new AudioDevice(this._api, id);
  }
}
