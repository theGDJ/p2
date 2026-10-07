import assert from "node:assert/strict";
import path from "node:path";
import sharp from "sharp";
import { createWorker, PSM } from "tesseract.js";
import { scanLabel } from "../src/lib/verify/ocr";

// Pass pairs of original photo paths and expected identifiers. Photos stay
// local and are not copied to public assets or committed as fixtures.
async function main() {
  const args = process.argv.slice(2);
  assert.ok(args.length > 0 && args.length % 2 === 0, "Usage: npm run test:ocr -- <photo> <expected ID> [<photo> <expected ID> ...]");
  const worker = await createWorker("eng", 1, {
    langPath: path.resolve("public/tesseract/tessdata"), cacheMethod: "none",
  });
  try {
    for (let i = 0; i < args.length; i += 2) {
      const [file, expected] = args.slice(i, i + 2);
      const started = Date.now();
      const { data, info } = await sharp(file).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let passes = 0;
      const result = await scanLabel({ width: info.width, height: info.height, data: new Uint8ClampedArray(data) }, async (frame, mode) => {
        passes += 1;
        await worker.setParameters({ tessedit_pageseg_mode: mode === "sparse" ? PSM.SPARSE_TEXT : PSM.SINGLE_BLOCK });
        const buffer = await sharp(Buffer.from(frame.data), { raw: { width: frame.width, height: frame.height, channels: 4 } }).png().toBuffer();
        return (await worker.recognize(buffer)).data;
      });
      assert.deepEqual(result.candidates.map((candidate) => candidate.normalised), [expected], path.basename(file));
      console.log(`✓ ${path.basename(file)} → ${expected} (${passes} passes, ${Date.now() - started} ms)`);
    }
  } finally {
    await worker.terminate();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
