import type { AudioSampleFormat } from "../../sampleFormats.ts";
import pa from "../ffi/mod.ts";
import { AudioError, PortAudioError } from "../err.ts";
import type { AudioDevice } from "../hardware/mod.ts";
import type { StreamLimitOptions, StreamOptions, StreamType } from "./types.ts";
import { createStreamParams } from "./utils.ts";

const CLIP_OFF_FLAG = BigInt(0x00000001);

/**
 * Abstract base class for audio streams.
 */
export abstract class AudioStream<TFormat extends AudioSampleFormat = AudioSampleFormat> implements StreamOptions<TFormat> {
  protected _infoView: Deno.UnsafePointerView
  protected _pointer: Deno.PointerValue
  protected _maxChunks: number = Infinity;
  protected _parsedChunks: number = 0;


  public readonly device: AudioDevice;
  public readonly channels: number
  public readonly sampleFormat: TFormat
  public readonly suggestedLatency: number
  public readonly framesPerBuffer: number

  constructor(
    private _type: StreamType,
    options: StreamOptions<TFormat>
  ) {
    const pointerToPointer = AudioError.parseNotNull(Deno.UnsafePointer.of(new ArrayBuffer(8)));
    const params = createStreamParams(options);
    PortAudioError.parseCode(pa.symbols.Pa_OpenStream(
      pointerToPointer,
      _type === "input" ? params : null,
      _type === "output" ? params : null,
      options.sampleRate,
      BigInt(options.framesPerBuffer),
      CLIP_OFF_FLAG,
      null,
      null,
    ));

    this._pointer = Deno.UnsafePointer.create(
      new Deno.UnsafePointerView(
        pointerToPointer
      ).getBigUint64()
    );

    const infoPointer = AudioError.parseNotNull(pa.symbols.Pa_GetStreamInfo(this._pointer));
    this._infoView = new Deno.UnsafePointerView(infoPointer);

    // if (this._structVersion !== 1) {
    //   throw new AudioError(`Unsupported stream info struct version: ${this._structVersion}`);
    // }

    this.device = options.device;
    this.channels = options.channels
    this.sampleFormat = options.sampleFormat
    this.suggestedLatency = options.suggestedLatency
    this.framesPerBuffer = options.framesPerBuffer

    PortAudioError.parseCode(pa.symbols.Pa_StartStream(this._pointer));
  }

  protected get _structVersion(): number { return this._infoView.getInt32(0); }

  protected get _inputLatency(): number { return this._infoView.getFloat64(8); }

  protected get _outputLatency(): number { return this._infoView.getFloat64(16); }

  /**
   * Gets the latency of the stream in seconds.
   * 
   * This field provides the most accurate estimate of input latency available to the implementation.
   * It may differ significantly from the `suggestedLatency`.
   * 
   * @returns The input latency of the stream in seconds.
   */
  get latency(): number {
    if (this._type === "input") {
      return this._inputLatency;
    }
    return this._outputLatency;
  }

  /**
   * Gets the sample rate of the stream in Hertz (samples per second).
   * 
   * In cases where the hardware sample rate is inaccurate and PortAudio is aware of it,
   * the value of this field may be different from the `sampleRate` provided.
   * If information about the actual hardware sample rate is not available,
   * this field will have the same value as the `sampleRate` provided.
   * 
   * @returns The sample rate of the stream in Hertz (samples per second).
   */
  get sampleRate(): number {
    return this._infoView.getFloat64(24); 
  }

  /**
   * Gets the time of the stream in seconds.
   * 
   * This field provides the most accurate estimate of time available to the implementation.
   */
  get time(): number {
    return PortAudioError.parseCode(pa.symbols.Pa_GetStreamTime(this._pointer));
  }

  /**
   * Gets the CPU load of the stream.
   * 
   * This field provides a measure of the CPU usage of the stream.
   * It is a percentage of the CPU usage of the stream.
   * 
   * @returns The CPU load of the stream.
   */
  get cpuLoad(): number {
    return PortAudioError.parseCode(pa.symbols.Pa_GetStreamCpuLoad(this._pointer));
  }

  /**
   * Stops the stream. Ensures all queued data is processed.
   */
  stop(): void {
    if (this._pointer === null) return;
    PortAudioError.parseCode(pa.symbols.Pa_StopStream(this._pointer));
    this._close();
  }

  /**
   * Stops the stream ASAP. Discards all queued data.
   */
  abort(): void {
    if (this._pointer === null) return;
    PortAudioError.parseCode(pa.symbols.Pa_AbortStream(this._pointer));
    this._close();
  }

  stopAfter({
    hours = 0,
    minutes = 0,
    seconds = 0,
    miliseconds = 0,
    samples = 0,
    chunks = 0
  }: Partial<StreamLimitOptions>): this {
    minutes += hours * 60;
    seconds += minutes * 60;
    seconds += miliseconds / 1000;
    samples += seconds * this.sampleRate;
    chunks += samples / this.framesPerBuffer;
    this._maxChunks = Math.floor(chunks);
    return this;
  }


  /**
   * Checks it the stream was stopped or aborted.
   */
  get isStopped(): boolean {
    if (!this._pointer) return true;
    return pa.symbols.Pa_IsStreamStopped(this._pointer) === 1;
  }

  /**
   * Checks it the stream is active.
   */
  get isActive(): boolean {
    if (!this._pointer) return false;
    return pa.symbols.Pa_IsStreamActive(this._pointer) === 1;
  }

  protected _assertOperable(): void {
    if (!this._pointer) {
      throw new AudioError("Stream is closed");
    }
    if (this.isStopped) {
      throw new AudioError("Stream is stopped");
    }
    if (!this.isActive) {
      throw new AudioError("Stream is not active");
    }
  }

  private _close(): void {
    PortAudioError.parseCode(pa.symbols.Pa_CloseStream(this._pointer));
    this._pointer = null;
  }

  [Symbol.dispose](): void {
    this.stop();
  }

}
