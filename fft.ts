/**
 * @module fft
 *
 * Provides functions for Fast Fourier Transform (FFT) and frequency mapping.
 */
import { isPowerOf2 } from "./utils.ts";

/**
 * Computes the frequency magnitudes from an audio waveform using FFT.
 * Uses Cooley-Tukey FFT algorithm.
 * 
 * @param input - An Float32Array of real-valued audio samples which must have a length that is a power of 2
 * @returns Array of frequency magnitudes
 */
export function fft(
  input: Float32Array
): Uint8Array {
  const n = input.length;
  if (!isPowerOf2(n)) {
    throw new Error('Input array length must be a power of 2');
  }

  const real = input.slice(0, n);
  const imag = new Float32Array(n).fill(0);

  // Bit reversal permutation
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
    let m = n >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  // Cooley-Tukey FFT
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wlenReal = Math.cos(ang);
    const wlenImag = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let wReal = 1;
      let wImag = 0;
      for (let j = 0; j < len / 2; j++) {
        const uReal = real[i + j];
        const uImag = imag[i + j];
        const vReal = real[i + j + len / 2] * wReal - imag[i + j + len / 2] * wImag;
        const vImag = real[i + j + len / 2] * wImag + imag[i + j + len / 2] * wReal;
        real[i + j] = uReal + vReal;
        imag[i + j] = uImag + vImag;
        real[i + j + len / 2] = uReal - vReal;
        imag[i + j + len / 2] = uImag - vImag;
        // Update w
        const nextWReal = wReal * wlenReal - wImag * wlenImag;
        wImag = wReal * wlenImag + wImag * wlenReal;
        wReal = nextWReal;
      }
    }
  }

  // Calculate magnitude spectrum
  const magnitudes = new Uint8Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  return magnitudes;
}

/**
 * Maps FFT bin indices to their corresponding frequencies in Hz.
 * Note: The returned array has length `fftSize / 2`.
 *
 * @param sampleRate - The sample rate of the audio (e.g., 44100)
 * @param fftSize - The FFT size (number of input samples)
 * @returns Array of frequencies in Hz for each FFT bin (length = fftSize/2)
 */
export function fftFrequencies(
  fftSize: number,
  sampleRate: number
): number[] {
  const freqs = new Array(fftSize / 2);
  for (let k = 0; k < fftSize / 2; k++) {
    freqs[k] = k * sampleRate / fftSize;
  }
  return freqs;
}

