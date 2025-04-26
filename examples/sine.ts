import { chunker, initialize, play, sine, terminate } from "../mod.ts";

const OPTIONS = {
  channels: 1,
  framesPerBuffer: 2048,
  sampleRate: 44100,
  sampleFormat: "float32",
} as const;

const wave = sine(440, OPTIONS);

const source = chunker(wave, OPTIONS);

initialize();

const stream = play(OPTIONS).stopAfter({ seconds: 2 });

await stream.from(source);

terminate();
