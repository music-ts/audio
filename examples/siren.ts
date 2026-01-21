import {
  chunker,
  initAudioApi,
  loop,
  queue,
  ramp,
  repeat,
  sine,
} from "../mod.ts";

const Eb5 = 622.26;
const A5 = 880;

using audio = await initAudioApi();

const stream = audio.play().stopAfter({ seconds: 10 });

const sec = stream.sampleRate;

function fadeInOut(t: number): number {
  return Math.sin(Math.PI / 2 * t);
}

const sirenFrequency = loop(queue(
  repeat(Eb5, sec / 4),
  ramp(Eb5, A5, sec / 4, fadeInOut),
  repeat(A5, sec / 4),
  ramp(A5, Eb5, sec / 4, fadeInOut),
));

const wave = sine(sirenFrequency, stream);

const source = chunker(wave, stream);

await stream.from(source);
