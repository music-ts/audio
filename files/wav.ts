import type { AudioOptions } from "../mod.ts";
import {
  AUDIO_SAMPLE_FORMATS,
  type AudioBuffer,
  type AudioSampleFormat,
} from "../sampleFormats.ts";

/**
 * Creates a WAV file from an array of audio buffers.
 *
 * @param buffers - An array of audio buffers.
 * @param param1 - Audio options.
 * @param param1.channels - Number of channels.
 * @param param1.sampleFormat - Sample format.
 * @param param1.sampleRate - Sample rate.
 * @param param1.framesPerBuffer - Frames per buffer.
 * @returns A Uint8Array containing the WAV file.
 */
export function createWavFile<TFormat extends AudioSampleFormat>(
  buffers: AudioBuffer<TFormat>[],
  {
    channels,
    sampleFormat,
    sampleRate,
  }: AudioOptions<TFormat>,
): Uint8Array<ArrayBuffer> {
  const formatter = AUDIO_SAMPLE_FORMATS[sampleFormat];
  const frameByteSize = formatter.Array.BYTES_PER_ELEMENT;
  const frameBitSize = frameByteSize * 8;

  const numFrames = buffers.reduce((acc, buffer) => acc + buffer.length, 0);

  const fileBuffer = new ArrayBuffer(44 + numFrames * frameByteSize);
  const view = new DataView(fileBuffer);

  // "RIFF"
  view.setInt32(0, 0x52494646);

  // file size
  view.setInt32(4, 36 + numFrames * frameByteSize);

  // "WAVE"
  view.setInt32(8, 0x57415645);

  // "fmt "
  view.setInt32(12, 0x666d7420);

  // fmt header size
  view.setInt32(16, 16, true);

  // audio format
  const wavFormat = formatter.isFloating
    ? 3 // IEEE_FLOAT
    : 1; // PCM
  view.setInt16(20, wavFormat, true);

  // number of channels
  view.setInt16(22, channels, true);

  // sample rate
  view.setInt32(24, sampleRate, true);

  // byte rate (sample rate * number of channels * bytes per sample)
  view.setInt32(28, sampleRate * channels * frameByteSize, true);

  // block alignment (number of channels * bytes per sample)
  view.setInt16(32, channels * frameByteSize, true);

  // bits per sample
  view.setInt16(34, frameBitSize, true);

  // "data"
  view.setInt32(36, 0x64617461);

  // number of bytes in rest of data
  view.setInt32(40, numFrames * frameByteSize, true);

  let offset = 44;

  for (let i = 0; i < buffers.length; i++) {
    for (let j = 0; j < buffers[i].length; j++) {
      const sample = buffers[i][j];
      view[formatter.viewSetMethod](offset, sample, true);
      offset += frameByteSize;
    }
  }

  return new Uint8Array(fileBuffer);
}

export function readWavFile(
  data: Uint8Array<ArrayBuffer>,
): { options: AudioOptions; samples: AudioBuffer } {
  const view = new DataView(data.buffer);

  const isRIFF = view.getInt32(0) === 0x52494646;
  const isWAVE = view.getInt32(8) === 0x57415645;
  const isFmt = view.getInt32(12) === 0x666d7420;
  const wavFormat = view.getUint16(20, true);
  const isData = view.getInt32(36) === 0x64617461;

  if (!isRIFF || !isWAVE || !isData) {
    throw new Error("Invalid WAV file");
  }
  if (!isFmt || !(wavFormat === 1 || wavFormat === 3)) {
    throw new Error("Unknown WAV format");
  }

  const channels = view.getInt16(22, true);
  const sampleRate = view.getInt32(24, true);
  const frameBitSize = view.getInt16(34, true);
  const frameByteSize = frameBitSize / 8;

  const isFloat = wavFormat === 3; // IEEE_FLOAT
  const formatterResult = Object.entries(AUDIO_SAMPLE_FORMATS).find(
    ([_, f]) => {
      return f.isFloating === isFloat &&
        f.Array.BYTES_PER_ELEMENT === frameByteSize;
    },
  );
  if (!formatterResult) {
    throw new Error("Unsupported WAV format");
  }
  const [sampleFormat, formatter] = formatterResult as [
    AudioSampleFormat,
    typeof AUDIO_SAMPLE_FORMATS[AudioSampleFormat],
  ];

  const totalFrames = view.getInt32(40, true) / frameByteSize;

  const samples = new formatter.Array(totalFrames) as AudioBuffer;

  for (let i = 0; i < totalFrames; i++) {
    samples[i] = view[formatter.viewGetMethod](44 + i * frameByteSize, true);
  }

  return {
    options: {
      channels,
      sampleFormat,
      sampleRate,
    },
    samples,
  };
}
