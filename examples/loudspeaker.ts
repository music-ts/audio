import { initAudioApi } from "../mod.ts";

using audio = await initAudioApi();

const mic = audio.record().stopAfter({ seconds: 5 });

await audio.play().from(mic);
