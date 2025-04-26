import {
  DEFAULT_CHANNELS,
  DEFAULT_FRAMES_PER_BUFFER,
  DEFAULT_SAMPLE_FORMAT,
  DEFAULT_SAMPLE_RATE,
} from "../../const.ts";
import {
  AUDIO_SAMPLE_FORMATS,
  type AudioBuffer,
  type AudioSampleFormat,
} from "../../sampleFormats.ts";
import pa from "../ffi/mod.ts";
import { PortAudioError } from "../err.ts";
import { defaultInputDevice } from "../hardware/mod.ts";
import type { StreamOptions } from "./types.ts";
import { AudioStream } from "./abstract.ts";
import { delay } from "jsr:@std/async";

/**
 * Opens an input audio stream for recording from the specified device.
 * @param options Stream options.
 * @returns An {@link AudioInputStream} for recording.
 */
export function record<
  TFormat extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT,
>({
  device = defaultInputDevice(),
  channels = DEFAULT_CHANNELS,
  sampleFormat = DEFAULT_SAMPLE_FORMAT as TFormat,
  suggestedLatency = device.defaultLowInputLatency,
  sampleRate = DEFAULT_SAMPLE_RATE,
  framesPerBuffer = DEFAULT_FRAMES_PER_BUFFER,
}: Partial<StreamOptions<TFormat>> = {}): AudioInputStream<TFormat> {
  return new AudioInputStream({
    device,
    channels,
    sampleFormat,
    suggestedLatency,
    sampleRate,
    framesPerBuffer,
  });
}

/**
 * Represents an input audio stream for recording from an audio device.
 */
export class AudioInputStream<TFormat extends AudioSampleFormat>
  extends AudioStream<TFormat>
  implements AsyncIterable<AudioBuffer<TFormat>, void, unknown> {
  constructor(options: StreamOptions<TFormat>) {
    super("input", options);
  }

  async read(): Promise<AudioBuffer<TFormat>> {
    this._assertOperable();
    const { framesPerBuffer, sampleFormat } = this;

    while (true) {
      const available = pa.symbols.Pa_GetStreamReadAvailable(this._pointer);
      if (available >= framesPerBuffer) {
        const buffer = new AUDIO_SAMPLE_FORMATS[sampleFormat].Array(
          framesPerBuffer,
        ) as AudioBuffer<TFormat>;
        PortAudioError.parseCode(pa.symbols.Pa_ReadStream(
          this._pointer,
          buffer,
          BigInt(framesPerBuffer),
        ));
        this._parsedChunks++;
        if (this._parsedChunks >= this._maxChunks) {
          this.abort();
        }
        return buffer;
      }
      await delay(0); // Prevents clogging the event loop
    }
  }

  async *[Symbol.asyncIterator]() {
    while (!this.isStopped) {
      yield await this.read();
    }
  }
}
