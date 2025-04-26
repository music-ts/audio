import {
  DEFAULT_CHANNELS,
  DEFAULT_FRAMES_PER_BUFFER,
  DEFAULT_SAMPLE_FORMAT,
  DEFAULT_SAMPLE_RATE,
} from "../../const.ts";
import type { AudioBuffer, AudioSampleFormat } from "../../sampleFormats.ts";
import pa from "../ffi/mod.ts";
import { AudioError, PortAudioError } from "../err.ts";
import { defaultOutputDevice } from "../hardware/mod.ts";
import type { StreamOptions } from "./types.ts";
import { AudioStream } from "./abstract.ts";

/**
 * Opens an output audio stream for playback to the specified or default output device.
 * @param options Stream options.
 * @returns An {@link AudioOutputStream} for playback.
 */
export function play<
  TFormat extends AudioSampleFormat = typeof DEFAULT_SAMPLE_FORMAT,
>({
  device = defaultOutputDevice(),
  channels = DEFAULT_CHANNELS,
  sampleFormat = DEFAULT_SAMPLE_FORMAT as TFormat,
  suggestedLatency = device.defaultLowOutputLatency,
  sampleRate = DEFAULT_SAMPLE_RATE,
  framesPerBuffer = DEFAULT_FRAMES_PER_BUFFER,
}: Partial<StreamOptions<TFormat>> = {}): AudioOutputStream<TFormat> {
  return new AudioOutputStream({
    device,
    channels,
    sampleFormat,
    suggestedLatency,
    sampleRate,
    framesPerBuffer,
  });
}

/**
 * Represents an output audio stream for playback to an audio device.
 */
export class AudioOutputStream<TFormat extends AudioSampleFormat>
  extends AudioStream<TFormat> {
  constructor(options: StreamOptions<TFormat>) {
    super("output", options);
  }

  /**
   * Writes a buffer of audio data to the stream.
   * @param buffer The audio data to write.
   * @throws If the stream is not operable or the buffer length does not match framesPerBuffer.
   */
  async write(buffer: AudioBuffer<TFormat>): Promise<void> {
    this._assertOperable();
    if (buffer.length !== this.framesPerBuffer) {
      throw new AudioError(
        `Buffer length (${buffer.length}) does not match framesPerBuffer (${this.framesPerBuffer})`,
      );
    }
    PortAudioError.parseCode(
      await pa.symbols.Pa_WriteStream(
        this._pointer,
        buffer,
        BigInt(this.framesPerBuffer),
      ),
    );
    this._parsedChunks++;
    if (this._parsedChunks >= this._maxChunks) {
      this.abort();
    }
  }

  /**
   * Writes a buffer of audio data to the stream.
   * @param iterable The audio chunks to write.
   * @throws If the stream is not operable or the buffer length does not match framesPerBuffer.
   */
  async from(
    iterable:
      | Iterable<AudioBuffer<TFormat>, void, unknown>
      | AsyncIterable<AudioBuffer<TFormat>, void, unknown>,
  ): Promise<void> {
    this._assertOperable();
    for await (const buffer of iterable) {
      if (this.isStopped) return;
      await this.write(buffer);
    }
    this.stop();
  }
}
