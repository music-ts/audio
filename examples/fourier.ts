import { fft, fftFrequencies, chunker, limit, mix, sine } from "../mod.ts";

// Declare fft size. Must be a power of 2.
// Tip: The bigger the size, the higher the resolution of the frequency spectrum.
const FFT_SIZE = 2048;

const OPTIONS = {
  sampleRate: 44100,
  sampleFormat: "float32",
  framesPerBuffer: FFT_SIZE,
} as const;

// Mix two frequencies
const wave = mix(
  sine(440, OPTIONS),
  sine(660, OPTIONS)
);

// Create one chunk
const source = limit(
  chunker(wave, OPTIONS),
  1,
);

for (const chunk of source) {
  const magnitudes = fft(chunk);
  const frequencies = fftFrequencies(OPTIONS.sampleRate, FFT_SIZE);

  for (let i = 0; i < magnitudes.length; i++) {
    console.log(`${
      ("#" + (i + 1).toString()).padStart(8)
    } - ${
      frequencies[i].toFixed(2).padStart(8)
    } Hz: ${
      magnitudes[i].toString().padStart(4)
    }`);
  }
}



