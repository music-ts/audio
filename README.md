# Audio Processing Library

This project provides utilities and modules for audio signal processing, written in TypeScript. It includes implementations for FFT, audio generation, sample format conversions, and various utility functions for handling audio data. Uses [PortAudio](https://www.portaudio.com/) behind the scenes.

## Features

- ### Audio API
  - Get audio devices and host APIs
  - Access default input/output devices
  - Record from microphones
  - Play to speakers
  - Control stream parameters (channels, sample rate, sample format, etc.)
  - Async stream reading/writing

- ### FFT (Fast Fourier Transform)
  - Compute frequency spectrum from audio buffers
  - Map FFT bins to real-world frequencies

- ### Audio Generators
  - Generate sine, square, sawtooth, and triangle waves
  - Mix multiple waves
  - Combine multiple generators into a multi-channel generator
  - Volume adjustment and ramping
  - Looping, repeating, and sequencing signals
  - Chunking and limiting sample streams

- ### File Utilities
  - Read and write audio files in WAV format

## Get started
This example shows how to record from a microphone and play it back. Check the [examples directory](./examples) for more. 

IMPORTANT: Always **initialize** the API before getting devices or opening streams and **terminate** the API when done to release resources. You can also create an [audio task](./examples/task.ts) to handle initialization, termination, and error handling automatically.

```typescript
import { initialize, terminate, record, play } from "jsr:@music/audio";

// Start the PortAudio API
initialize();

// Define stream options (optional, showing default values)
const OPTIONS = {
  channels: 1,
  sampleFormat: "float32",
  sampleRate: 44100,
  framesPerBuffer: 2048,
} as const;

// Recording
console.log("Recording...");

const input = record(OPTIONS).stopAfter({ seconds: 5 });

const data = await Array.fromAsync(input);

// Playing
console.log("Playing...");

await play(OPTIONS).from(data);

// Terminate PortAudio
terminate();
```

## Basic Terminology
- `sample` or `frame`: A single number representing a wave's amplitude at a specific point in time
- `buffer` or `chunk`: A collection of frames
- `sampleRate`: The number of samples per second
- `sampleFormat`: The format of audio samples (e.g., float32, int16, int8)
- `framesPerBuffer`: The number of frames per buffer
- `channel`: A single audio stream (e.g., left, right, center)
- `latency` (in an input stream): The time delay between when audio is recorded and when it is available for processing
- `latency` (in an output stream): The time delay between when audio data is passed to the stream and when it is played






