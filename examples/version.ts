import { initAudioApi } from "../mod.ts";

using audio = await initAudioApi();

console.log(audio.version());
