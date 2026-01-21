import type { AudioBuffer, AudioSampleFormat } from "../../sampleFormats.ts";
import { AudioError, PortAudioError } from "../err.ts";
import type { AudioApi } from "../mod.ts";
import type { StreamOptions } from "./types.ts";
import { AudioStream } from "./abstract.ts";

/**
 * Represents an output audio stream for playback to an audio device.
 */
export class AudioOutputStream<TFormat extends AudioSampleFormat>
  extends AudioStream<TFormat> {
  constructor(_api: AudioApi, options: StreamOptions<TFormat>) {
    super(_api, "output", options);
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
      this._api,
      await this._api._lib.symbols.Pa_WriteStream(
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
