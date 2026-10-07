"use client";

import { useEffect, useId, useRef, useState } from "react";
import { type MarkType } from "@/lib/verify/extract";
import { scanLabel, type LabelImage } from "@/lib/verify/ocr";
import Link from "next/link";
import { standardHref } from "@/lib/format";
import { useLocale } from "@/lib/locale-context";
import { tx } from "@/lib/i18n";

type ScanCandidate = { type: MarkType; value: string; confidence: number };
type RegistryRow = {
  markNo: string; type: string; holder: string; product: string; standardCode: string | null;
  status: string; issuedOn: string; validTill: string; city: string;
};
type ScanResponse = {
  verdict: "VALID_IN_REGISTRY" | "SUSPENDED" | "EXPIRED" | "NOT_FOUND" | "NO_MARK_DETECTED";
  matches: RegistryRow[];
  catalogue: { queriedCode: string | null; status: "FOUND" | "NOT_FOUND" | "NOT_PROVIDED"; matches: { code: string; title: string }[]; exactEdition: boolean };
  checks: { formatValid: boolean; foundInRegistry: boolean; statusActive: boolean; withinValidity: boolean; standardConsistent: boolean | null };
};

const TYPE_LABEL: Record<MarkType, string> = {
  isi: "ISI licence", crs: "CRS registration", jeweller: "Jeweller registration", huid: "HUID",
};
const STATUS_CLASS: Record<string, string> = { valid: "tag-ok", suspended: "tag-qco", expired: "tag-danger" };

function readPixels(image: HTMLImageElement): LabelImage {
  const scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is unavailable.");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { width: canvas.width, height: canvas.height, data: context.getImageData(0, 0, canvas.width, canvas.height).data };
}

export function ScanMark() {
  const { locale } = useLocale();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<ScanCandidate[]>([]);
  const [isCode, setIsCode] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);
  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  function clearPreview() {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPreview(null);
  }

  async function readFile(file: File) {
    if (reading) return;
    if (!file.type.startsWith("image/")) {
      setMessage(tx(locale, "Choose an image file."));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setMessage(tx(locale, "Choose an image smaller than 15 MB."));
      return;
    }
    clearPreview();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreview(url);
    setCandidates([]);
    setIsCode("");
    setMessage("");
    setResult(null);
    setConfidence(null);
    setProgress(0);
    setReading(true);
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      // Licence identifiers use Latin prefixes and digits in both UI languages.
      const { createWorker, PSM } = await import("tesseract.js");
      worker = await createWorker("eng", 1, {
        workerPath: "/tesseract/worker.min.js",
        corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
        langPath: "/tesseract/tessdata",
        workerBlobURL: false,
        gzip: true,
        logger: (event) => {
          if (event.status === "loading language traineddata")
            setProgress(Math.max(10, Math.round(event.progress * 25)));
        },
      });
      const activeWorker = worker;
      const scan = await scanLabel(readPixels(image), async (frame, mode) => {
        const canvas = document.createElement("canvas");
        canvas.width = frame.width;
        canvas.height = frame.height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is unavailable.");
        const pixels = context.createImageData(frame.width, frame.height);
        pixels.data.set(frame.data);
        context.putImageData(pixels, 0, 0);
        await activeWorker.setParameters({
          tessedit_pageseg_mode: mode === "sparse" ? PSM.SPARSE_TEXT : PSM.SINGLE_BLOCK,
        });
        return (await activeWorker.recognize(canvas)).data;
      }, (value) => setProgress(25 + Math.round(value * 0.75)));
      const extracted = scan.candidates;
      const candidates = extracted.map((candidate) => ({
        type: candidate.type, value: candidate.normalised, confidence: candidate.confidence,
      }));
      setCandidates(candidates);
      setIsCode(scan.isCode ?? "");
      setConfidence(scan.confidence);
      if (!extracted.length)
        setMessage(tx(locale, "No mark number detected. Try good light, hold steady, and fill the frame with the mark—or type the number above."));
      else if (scan.confidence < 45)
        setMessage(tx(locale, "The photo may be blurry or the reading uncertain. Check each detected digit before verifying."));
    } catch (error) {
      console.error("Label OCR failed:", error);
      setMessage(typeof navigator !== "undefined" && !navigator.onLine
        ? tx(locale, "OCR could not load while offline. Reconnect once to load the local OCR engine, or type the number above.")
        : tx(locale, "OCR could not be loaded or the image could not be read. Try again or type the number above."));
    } finally {
      await worker?.terminate().catch(() => undefined);
      setReading(false);
    }
  }

  async function verify() {
    const submitted = candidates.map((candidate) => candidate.value.trim().toUpperCase()).filter(Boolean);
    setVerifying(true);
    setMessage("");
    setResult(null);
    try {
      const response = await fetch("/api/verify/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: submitted, ...(isCode.trim() ? { isCode: isCode.trim() } : {}) }),
      });
      if (!response.ok) throw new Error("Registry request failed.");
      setResult((await response.json()) as ScanResponse);
    } catch {
      setMessage(typeof navigator !== "undefined" && !navigator.onLine
        ? tx(locale, "You appear to be offline. Reconnect and try registry verification again.")
        : tx(locale, "The registry could not be reached. Try again in a moment."));
    } finally {
      setVerifying(false);
    }
  }

  const verdictCopy: Record<ScanResponse["verdict"], string> = {
    VALID_IN_REGISTRY: "Found in the registry",
    SUSPENDED: "Found in the registry — suspended",
    EXPIRED: "Found in the registry — expired",
    NOT_FOUND: "Registration number not found in the demo registry",
    NO_MARK_DETECTED: "No mark detected",
  };

  return (
    <div className="mt-5 border-t border-rule pt-5">
      <button type="button" className="btn btn-secondary" aria-expanded={open} aria-controls={id + "-scan"}
        onClick={() => { setOpen((value) => !value); setMessage(""); }}>
        {open ? tx(locale, "Close label scanner") : tx(locale, "Scan label")}
      </button>
      {open && (
        <div id={id + "-scan"} className="mt-4 space-y-4">
          <p className="text-sm text-muted">{tx(locale, "The photo stays in your browser. Only the identifiers you choose to verify are sent to the demo registry.")}</p>
          <input ref={inputRef} id={id + "-file"} className="sr-only" type="file" accept="image/*" capture="environment" disabled={reading}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) void readFile(file);
              event.currentTarget.value = "";
            }}
            aria-label={tx(locale, "Choose or photograph a product label")} />
          {!preview && (
            <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files[0];
                if (file) void readFile(file);
              }}>
              {tx(locale, "Choose photo or drop it here")}
            </button>
          )}
          {preview && (
            <div className="space-y-3">
              {/* The object URL is local to this browser and is never sent to an API. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={tx(locale, "Preview of the label photo")} className="max-h-64 rounded-md border border-rule object-contain" />
              <button type="button" className="btn btn-secondary btn-sm" disabled={reading} onClick={() => inputRef.current?.click()}>
                {tx(locale, "Retake or choose another")}
              </button>
            </div>
          )}
          {reading && (
            <div className="space-y-2" aria-live="polite">
              <p className="text-sm text-muted">{tx(locale, "Reading label…")} {progress}%</p>
              <progress className="w-full" value={progress} max={100} aria-label={tx(locale, "OCR progress")} />
            </div>
          )}
          {(!!candidates.length || !!isCode) && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-ink">{tx(locale, "Check the detected identifiers")}</p>
              {candidates.map((candidate, index) => (
                <div key={candidate.type + "-" + index}>
                  <label htmlFor={id + "-candidate-" + index} className="label">{tx(locale, TYPE_LABEL[candidate.type])}</label>
                  <input id={id + "-candidate-" + index} className="field id mt-1 w-full" value={candidate.value}
                    autoCapitalize="characters" spellCheck={false}
                    onChange={(event) => { setResult(null); setCandidates((all) => all.map((item, i) =>
                      i === index ? { ...item, value: event.target.value } : item,
                    )); }} />
                </div>
              ))}
              {confidence !== null && confidence < 65 &&
                <p className="text-sm text-muted">{tx(locale, "Low-confidence reading—please verify the digits carefully.")}</p>}
                <div>
                  <label htmlFor={id + "-iscode"} className="label">{tx(locale, "Detected IS code (optional)")}</label>
                  <input id={id + "-iscode"} className="field id mt-1 w-full" value={isCode} onChange={(event) => { setIsCode(event.target.value); setResult(null); }} />
                </div>
              <button type="button" className="btn btn-primary" onClick={() => void verify()} disabled={verifying || reading}>
                {verifying ? tx(locale, "Verifying…") : tx(locale, "Verify identifiers")}
              </button>
            </div>
          )}
          {message && <p className="text-sm text-attention-ink" role="status">{message}</p>}
          {result && (
            <div ref={resultRef} tabIndex={-1} className="sheet space-y-4 px-5 py-4 outline-none" aria-live="polite" aria-label={tx(locale, "Scan verification result")}>
              <div className="space-y-2 border-b border-rule pb-4">
                <p className="font-semibold text-ink">{tx(locale, "Standard catalogue")}</p>
                <p className="text-sm">{tx(locale, result.catalogue.status === "FOUND" ? "Standard found in the catalogue" : result.catalogue.status === "NOT_FOUND" ? "Standard not found in the catalogue" : "No IS code provided. Enter the code printed on the label to check the catalogue.")}</p>
                {result.catalogue.matches.map((standard) => (
                  <Link key={standard.code} href={standardHref(standard.code)} className="block text-sm underline underline-offset-4">
                    <span className="id">{standard.code}</span> — {standard.title}
                  </Link>
                ))}
                {result.catalogue.status === "FOUND" && !result.catalogue.exactEdition && (
                  <p className="text-sm text-muted">{tx(locale, "Matching catalogue records are shown. Check the part and year on the label to identify the exact edition.")}</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">{tx(locale, "Product registration")}</p>
                <p className="font-semibold text-ink">{tx(locale, verdictCopy[result.verdict])}</p>
                {result.verdict === "NOT_FOUND" && <p className="mt-2 text-sm text-muted">{tx(locale, "The IS code identifies a standard; the R-number or licence number identifies a product registration. A catalogue match does not verify the product. Missing from this demo registry does not mean the product is uncertified.")}</p>}
                <p className="mt-1 text-sm text-muted">{tx(locale, "The registry is a demonstration dataset, not official BIS confirmation.")}</p>
              </div>
              {result.matches.map((record) => (
                <div key={record.markNo} className="border-t border-rule pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={"tag " + (STATUS_CLASS[record.status] ?? "")}>{tx(locale, record.status)}</span>
                    <span className="id">{record.markNo}</span>
                  </div>
                  <p className="mt-2 font-semibold text-ink">{record.holder}</p>
                  <p className="text-sm text-body">{record.product}</p>
                  <dl className="mt-3 grid grid-cols-[100px_1fr] gap-x-3 gap-y-1 text-sm">
                    <dt className="text-muted">{tx(locale, "Standard")}</dt><dd className="id">{record.standardCode ?? tx(locale, "Not recorded")}</dd>
                    <dt className="text-muted">{tx(locale, "Valid until")}</dt><dd>{record.validTill}</dd>
                    <dt className="text-muted">{tx(locale, "Location")}</dt><dd>{record.city}</dd>
                  </dl>
                  <p className="mt-2 text-sm text-muted">{tx(locale, "Compare the holder and product with what you bought; a copied real number can also appear on a counterfeit label.")}</p>
                </div>
              ))}
              <ul className="space-y-1 border-t border-rule pt-3 text-sm">
                {([
                  ["formatValid", "Mark format is valid"],
                  ["foundInRegistry", "Found in the registry"],
                  ["statusActive", "Registry status is active"],
                  ["withinValidity", "Within the printed validity dates"],
                  ["standardConsistent", "Standard matches the label"],
                ] as const).filter(([key]) => result.checks[key] !== null && (key === "formatValid" || key === "foundInRegistry" || result.checks.foundInRegistry)).map(([key, label]) => (
                  <li key={key} className="flex items-center gap-2">
                    <span aria-hidden="true">{result.checks[key] ? "✓" : "—"}</span><span>{tx(locale, label)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted">{tx(locale, "For official confirmation, use the BIS Care App or contact BIS on helpline 1915.")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
