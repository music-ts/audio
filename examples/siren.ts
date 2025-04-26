import { chunker, initialize, loop, play, queue, ramp, repeat, sine, terminate } from "../mod.ts";

const Eb5 = 622.26;
const A5 = 880;

initialize();

const stream = play().stopAfter({ seconds: 10 });

const sec = stream.sampleRate;

function fadeInOut(t: number): number {
  return Math.sin(Math.PI / 2 * t);
}

const sirenFrequency = loop(queue(
  repeat(Eb5, sec/4),
  ramp(Eb5, A5, sec/4, fadeInOut),
  repeat(A5, sec/4),
  ramp(A5, Eb5, sec/4, fadeInOut),
));

const wave = sine(sirenFrequency, stream);

const source = chunker(wave, stream);

await stream.from(source);

terminate();
