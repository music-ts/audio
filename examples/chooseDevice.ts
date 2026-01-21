import { type AudioApi, chunker, initAudioApi, sine } from "../mod.ts";

function choose<T>(name: string, options: T[], keys: (keyof T)[]): T {
  console.clear();
  console.table(options.map((option) => {
    const row: Record<string, unknown> = {};
    for (const key of keys) {
      row[key.toString()] = option[key];
    }
    return row;
  }));
  const chosen = parseInt(
    prompt(`Choose ${name} (0 - ${options.length - 1}): `) ?? "",
  );
  if (isNaN(chosen) || chosen < 0 || chosen >= options.length) {
    throw new Error(`Invalid ${name} selected.`);
  }
  return options[chosen];
}

function chooseDevice(audio: AudioApi) {
  console.clear();

  const hostApis = Array.from(audio.getHostApis());
  const hostApi = choose("host API", hostApis, ["name"]);

  console.clear();
  console.log(`Host API: ${hostApi.name}`);

  const devices = Array.from(hostApi.devices());
  return choose("device", devices, [
    "name",
    "maxInputChannels",
    "maxOutputChannels",
    "defaultLowInputLatency",
    "defaultLowOutputLatency",
    "defaultSampleRate",
  ]);
}

using audio = await initAudioApi();
const device = chooseDevice(audio);
const stream = device.play();
const source = chunker(
  sine(440, stream),
  stream,
);
await stream.stopAfter({ seconds: 2 }).from(source);
