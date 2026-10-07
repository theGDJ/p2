import { extractMarks, normaliseIsCode } from "./extract";

export type LabelImage = { width: number; height: number; data: Uint8ClampedArray };
type Reading = { text: string; confidence: number };
type Recognize = (image: LabelImage, mode: "sparse" | "block") => Promise<Reading>;

/** Suppress fine surface texture without clipping faint printed digits. */
export function smoothLabel(image: LabelImage): LabelImage {
  const { width, height, data } = image;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i += 1)
    gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114;
  const kernel = Array.from({ length: 9 }, (_, i) => Math.exp(-((i - 4) ** 2) / (2 * 1.5 ** 2)));
  const sum = kernel.reduce((a, b) => a + b, 0);
  const horizontal = new Float32Array(gray.length);
  const blurred = new Uint8Array(gray.length);
  const histogram = new Uint32Array(256);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 0;
      for (let k = -4; k <= 4; k += 1)
        value += gray[y * width + Math.max(0, Math.min(width - 1, x + k))] * kernel[k + 4];
      horizontal[y * width + x] = value / sum;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 0;
      for (let k = -4; k <= 4; k += 1)
        value += horizontal[Math.max(0, Math.min(height - 1, y + k)) * width + x] * kernel[k + 4];
      const pixel = Math.round(value / sum);
      blurred[y * width + x] = pixel;
      histogram[pixel] += 1;
    }
  }
  let cumulative = 0;
  let low = 0;
  let high = 255;
  for (let i = 0; i < 256; i += 1) {
    cumulative += histogram[i];
    if (cumulative <= gray.length * 0.01) low = i;
    if (cumulative >= gray.length * 0.99) { high = i; break; }
  }
  const output = new Uint8ClampedArray(data.length);
  for (let i = 0; i < blurred.length; i += 1) {
    const value = (blurred[i] - low) * 255 / Math.max(1, high - low);
    output[i * 4] = output[i * 4 + 1] = output[i * 4 + 2] = value;
    output[i * 4 + 3] = 255;
  }
  return { width, height, data: output };
}

function crop(image: LabelImage, left: number, top: number, right: number, bottom: number): LabelImage {
  const x = Math.floor(left * image.width);
  const y = Math.floor(top * image.height);
  const width = Math.max(1, Math.floor(right * image.width) - x);
  const height = Math.max(1, Math.floor(bottom * image.height) - y);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let row = 0; row < height; row += 1) {
    const offset = ((y + row) * image.width + x) * 4;
    data.set(image.data.subarray(offset, offset + width * 4), row * width * 4);
  }
  return { width, height, data };
}

/** Shared by browser scanning and real-photo regression tests. No network or registry lookup. */
export async function scanLabel(image: LabelImage, recognize: Recognize, onProgress = (_progress: number) => {}) {
  // Try the untouched photo first. Aggressive contrast and enlargement amplify
  // plastic texture and can destroy faint digits on reflective labels.
  let reading = await recognize(image, "sparse");
  let candidates = extractMarks(reading.text);
  let isCode = normaliseIsCode(reading.text);
  onProgress(40);
  if (!candidates.length) {
    // Cover every part of any photo; no assumptions about screenshot layout.
    // Block segmentation keeps an entire registration line together where
    // sparse segmentation can split it into separate fragments.
    const regions = [
      [0, 0.7, 1, 1], [0, 0.467, 1, 0.767],
      [0, 0.233, 1, 0.533], [0, 0, 1, 0.3],
      [0.42, 0.42, 1, 1], [0, 0.42, 0.58, 1],
      [0.42, 0, 1, 0.58], [0, 0, 0.58, 0.58],
    ];
    for (const [index, [left, top, right, bottom]] of regions.entries()) {
      const result = await recognize(smoothLabel(crop(image, left, top, right, bottom)), "block");
      const found = extractMarks(result.text);
      isCode ??= normaliseIsCode(result.text);
      onProgress(40 + Math.round((index + 1) * 55 / regions.length));
      if (found.length) { reading = result; candidates = found; break; }
    }
  }
  onProgress(100);
  return { candidates, isCode, confidence: reading.confidence };
}
