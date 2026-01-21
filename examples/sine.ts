import { chunker, initAudioApi, sine } from "../mod.ts";

const OPTIONS = {
  channels: 1,
  framesPerBuffer: 2048,
  sampleRate: 44100,
  sampleFormat: "float32",
} as const;

const wave = sine(440, OPTIONS);

const source = chunker(wave, OPTIONS);

using audio = await initAudioApi();

const stream = audio.play(OPTIONS).stopAfter({ seconds: 2 });

await stream.from(source);
