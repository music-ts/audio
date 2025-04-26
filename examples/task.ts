import { audioTask, play, record } from "../mod.ts";

const recordAndRepeat = audioTask(
  async (seconds: number) => {
    const mic = record().stopAfter({ seconds });
    const chunks = await Array.fromAsync(mic);
    await play().from(chunks);
    return chunks;
  }
);

const [err, chunks] = await recordAndRepeat(5);

if (err) {
  console.log(`${err.name}: ${err.message}`);
  Deno.exit(1);
}

console.log(`Recorded ${chunks.length} chunks`);
  