# Audio Processing Library

This project provides utilities and modules for audio signal processing, written
in TypeScript. It includes implementations for FFT, audio generation, sample
format conversions, and various utility functions for handling audio data. Uses
[PortAudio](https://www.portaudio.com/) behind the scenes.

## Features

- ### Audio API
  - Instance-based API with automatic resource management
  - Get audio devices and host APIs
  - Access default input/output devices
  - Record from microphones and play to speakers
  - Control stream parameters (channels, sample rate, sample format, etc.)
  - Async stream reading/writing with method chaining
  - Automatic PortAudio library installation and management

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

This example shows how to record from a microphone and play it back. Check the
[examples directory](./examples) for more.

The new API uses an instance-based approach with automatic resource management. The `AudioApi` class handles all audio operations, and the `using` statement ensures proper cleanup.

```typescript
import { initAudioApi } from "jsr:@music/audio";

// Initialize the Audio API - handles PortAudio initialization automatically
using audio = await initAudioApi();

// Define stream options (optional, showing default values)
const OPTIONS = {
  channels: 1,
  sampleFormat: "float32",
  sampleRate: 44100,
  framesPerBuffer: 2048,
} as const;

// Recording
console.log("Recording...");

const input = audio.record(OPTIONS).stopAfter({ seconds: 5 });

const data = await Array.fromAsync(input);

// Playing
console.log("Playing...");

await audio.play(OPTIONS).from(data);

// Audio API is automatically terminated when the 'using' block ends
```

## API Usage Patterns

### Device Selection
```typescript
import { initAudioApi } from "jsr:@music/audio";

using audio = await initAudioApi();

// List all available devices
for (const device of audio.getDevices()) {
  console.log(`${device.name} - Input: ${device.maxInputChannels}, Output: ${device.maxOutputChannels}`);
}

// Use specific device
const device = Array.from(audio.getDevices()).find(d => d.name.includes("Speaker"));
if (device) {
  await device.play().from(audioData);
}
```

### Stream Control
```typescript
using audio = await initAudioApi();

// Method chaining for stream configuration
const stream = audio.record({
  channels: 2,
  sampleRate: 48000
}).stopAfter({ seconds: 10 });

// Process audio data
for await (const chunk of stream) {
  // Process chunk here
}
```

### Resource Management
The `AudioApi` class implements `Symbol.dispose`, enabling automatic resource cleanup:

```typescript
// Automatic cleanup with 'using'
using audio = await initAudioApi();
// API is automatically terminated when block ends

// Manual cleanup
const audio = await initAudioApi();
try {
  // Use audio API
} finally {
  audio[Symbol.dispose](); // Explicit cleanup
}
```

## Module Structure

The library is organized into several modules that can be imported individually:

```typescript
// Main entry point - includes all modules
import { initAudioApi, sine, fft, readWav } from "jsr:@music/audio";

// Individual modules
import { initAudioApi } from "jsr:@music/audio/api";
import { readWav, writeWav } from "jsr:@music/audio/files";
import { sine, square, sawtooth } from "jsr:@music/audio/generators";
import { fft, frequencyToBin } from "jsr:@music/audio/fourier";
```

## Basic Terminology

- `sample` or `frame`: A single number representing a wave's amplitude at a
  specific point in time
- `buffer` or `chunk`: A collection of frames
- `sampleRate`: The number of samples per second
- `sampleFormat`: The format of audio samples (e.g., float32, int16, int8)
- `framesPerBuffer`: The number of frames per buffer
- `channel`: A single audio stream (e.g., left, right, center)
- `latency` (in an input stream): The time delay between when audio is recorded
  and when it is available for processing
- `latency` (in an output stream): The time delay between when audio data is
  passed to the stream and when it is played
