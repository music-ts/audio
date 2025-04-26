import { chunker, initialize, limit, play, queue, loop, sine, terminate, ramp, volume, repeat, mix } from "../mod.ts";

initialize();

const BPM = 160; // beats per minute

const G3 = 196.00;
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;

const OPTIONS = {
  channels: 1,
  framesPerBuffer: 2048,
  sampleRate: 44100,
  sampleFormat: "float32",
} as const;

const beat = 60 / BPM * OPTIONS.sampleRate;

function tone(
  frequency: number, 
  beats: number,
) {
  const samples = beat * beats;
  const vol = queue(
    ramp(0, 1, beat * 0.1),
    ramp(1, 0, samples - beat * 0.1, Math.sqrt),
  );
  return limit(
    volume(
      sine(frequency, OPTIONS),
      vol,
    ),
    samples,
  );
}

function voice(no: number) {
  return queue(
    repeat(0, no * beat * 8),
    loop(queue(
      tone(C4, 1),
      tone(D4, 1),
      tone(E4, 1),
      tone(C4, 1),
    ), 2),
    loop(queue(
      tone(E4, 1),
      tone(F4, 1),
      tone(G4, 2),
    ), 2),
    loop(queue(
      tone(G4, .5),
      tone(A4, .5),
      tone(G4, .5),
      tone(F4, .5),
      tone(E4, 1),
      tone(C4, 1),
    ), 2),
    loop(queue(
      tone(C4, 1),
      tone(G3, 1),
      tone(C4, 2),
    ), 2)
  )
}

const mixer = mix(
  voice(0),
  voice(1),
  voice(2),
);

const source = chunker(mixer, OPTIONS);

await play(OPTIONS).from(source);

terminate();
