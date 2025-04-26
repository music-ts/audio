import {
  chunker,
  createWavFile,
  initialize,
  play,
  readWavFile,
  record,
  terminate,
} from "../mod.ts";

initialize();

const mic = record().stopAfter({ seconds: 5 });

const chunks = await Array.fromAsync(mic);

const wav = createWavFile(chunks, mic);

// await Deno.writeFile("recording.wav", wav);

const file = readWavFile(wav);

const stream = play(file.options);

const src = chunker(file.samples, stream);

await stream.from(src);

terminate();
