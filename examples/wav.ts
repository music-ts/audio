import {
  type AudioOptions,
  chunker,
  createWavFile,
  initAudioApi,
  readWavFile,
} from "../mod.ts";

using audio = await initAudioApi();

const options = {
  sampleFormat: "int16",
  sampleRate: 16_000,
  channels: 1,
} satisfies Partial<AudioOptions>;

const mic = audio.record(options).stopAfter({ seconds: 5 });
const chunks = await Array.fromAsync(mic);
const wav = createWavFile(chunks, mic);
await Deno.writeFile("recording.wav", wav);

const file = readWavFile(wav);
const stream = audio.play(file.options);
const src = chunker(file.samples, stream);
await stream.from(src);
