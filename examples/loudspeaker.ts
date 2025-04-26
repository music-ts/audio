import { initialize, play, record, terminate } from "../mod.ts";

initialize();

const mic = record().stopAfter({ seconds: 5 });

await play().from(mic);

terminate();
