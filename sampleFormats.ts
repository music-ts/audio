/**
 * Sample formats supported by PortAudio and JS.
 */
export const AUDIO_SAMPLE_FORMATS = {
  float32: {
    paTag: 0x00000001,
    Array: Float32Array,
    viewSetMethod: "setFloat32",
    viewGetMethod: "getFloat32",
    minValue: -1,
    maxValue: 1,
    isFloating: true
  },
  int32: {
    paTag: 0x00000002,
    Array: Int32Array,
    viewSetMethod: "setInt32",
    viewGetMethod: "getInt32",
    minValue: -0x80000000,
    maxValue: 0x7FFFFFFF,
    isFloating: false
  },
  int16: {
    paTag: 0x00000008,
    Array: Int16Array,
    viewSetMethod: "setInt16",
    viewGetMethod: "getInt16",
    minValue: -0x8000,
    maxValue: 0x7FFF,
    isFloating: false
  },
  int8: {
    paTag: 0x00000010,
    Array: Int8Array,
    viewSetMethod: "setInt8",
    viewGetMethod: "getInt8",
    minValue: -0x80,
    maxValue: 0x7F, 
    isFloating: false
  },
  uint8: {
    paTag: 0x00000020,
    Array: Uint8Array,
    viewSetMethod: "setUint8",
    viewGetMethod: "getUint8",
    minValue: 0,
    maxValue: 0xFF,
    isFloating: false,
    isUnsigned: true,
  },
} as const;

/**
 * Available audio sample formats.
 */
export type AudioSampleFormat = keyof typeof AUDIO_SAMPLE_FORMATS;

/**
 * Typed array of audio samples.
 */
export type AudioBuffer<T extends AudioSampleFormat = AudioSampleFormat> = InstanceType<
  (typeof AUDIO_SAMPLE_FORMATS)[T]['Array']
>;

/**
 * Common audio options.
 */
export type AudioOptions<TFormat extends AudioSampleFormat = AudioSampleFormat> = {
  channels: number;
  sampleFormat: TFormat;
  sampleRate: number;
};
