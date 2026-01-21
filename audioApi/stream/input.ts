import {
  AUDIO_SAMPLE_FORMATS,
  type AudioBuffer,
  type AudioSampleFormat,
} from "../../sampleFormats.ts";
import { delay } from "../../utils.ts";
import { PortAudioError } from "../err.ts";
import type { StreamOptions } from "./types.ts";
import { AudioStream } from "./abstract.ts";
import type { AudioApi } from "../mod.ts";

/**
 * Represents an input audio stream for recording from an audio device.
 */
export class AudioInputStream<TFormat extends AudioSampleFormat>
  extends AudioStream<TFormat>
  implements AsyncIterable<AudioBuffer<TFormat>, void, unknown> {
  constructor(
    _api: AudioApi,
    options: StreamOptions<TFormat>,
  ) {
    super(_api, "input", options);
  }

  /**
   * Reads a buffer of audio samples from the stream.
   */
  async read(): Promise<AudioBuffer<TFormat>> {
    this._assertOperable();
    const { framesPerBuffer, sampleFormat } = this;

    while (true) {
      const available = this._api._lib.symbols.Pa_GetStreamReadAvailable(
        this._pointer,
      );
      if (available >= framesPerBuffer) {
        const buffer = new AUDIO_SAMPLE_FORMATS[sampleFormat].Array(
          framesPerBuffer,
        ) as AudioBuffer<TFormat>;
        PortAudioError.parseCode(this._api, this._api._lib.symbols.Pa_ReadStream(
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

  async *[Symbol.asyncIterator](): AsyncGenerator<
    AudioBuffer<TFormat>,
    void,
    unknown
  > {
    while (!this.isStopped) {
      yield await this.read();
    }
  }
}
