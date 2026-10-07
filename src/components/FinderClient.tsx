"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { PROFILE_SCHEME_TO_CERT, categoryLabel, standardHref } from "@/lib/format";
import { Notice, ObligationTag, Spinner, StandardCode } from "@/components/ui";
import { useLocale } from "@/lib/locale-context";
import { tx } from "@/lib/i18n";

type Std = { id: number; code: string; title: string; summary: string; mandatory: boolean; scheme: string };
type Lab = { id: number; name: string; city: string; state: string; kind: string; standards: string[] };
type Result = {
  profile: {
    id: string; label: string; labelHi: string; category: string; mandatory: boolean; scheme: string;
    schemeLabel: string; schemeLabelHi: string; note: string; noteHi: string; steps: { title: string; desc: string }[]; timeline: string;
  };
  standards: Std[];
  labs: Lab[];
};
type Response = { matched: true; results: Result[] } | { matched: false; standards: Std[] };

const PRESETS = ["Electric ceiling fan", "Gold bangle", "Laptop adapter", "TMT steel bar", "Packaged drinking water"];

function Pathway({ result, query }: { result: Result; query: string }) {
  const { locale } = useLocale();
  const [stage, setStage] = useState(0);
  const [allStandards, setAllStandards] = useState(false);
  const [allLabs, setAllLabs] = useState(false);
  const p = result.profile;
  const steps = p.steps.slice(0, 5);
  const certId = PROFILE_SCHEME_TO_CERT[p.scheme];
  const current = steps[stage];

  return (
    <div className="space-y-5">
      <section aria-label={tx(locale, "Product verdict")} className={`border-l-4 px-4 py-3 ${p.mandatory ? "border-attention bg-attention-soft" : "border-navy bg-sunken"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold">{locale === "hi" ? p.labelHi : p.label}</h2>
          <ObligationTag mandatory={p.mandatory} long scheme={p.scheme} />
          <span className="tag">{locale === "hi" ? p.schemeLabelHi : p.schemeLabel}</span>
          <span className="text-sm text-muted">{tx(locale, p.timeline)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-body">{locale === "hi" ? p.noteHi : p.note}</p>
      </section>

      <section aria-labelledby="standards-h" className="sheet px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 id="standards-h" className="font-semibold">{tx(locale, "Applicable standards")}</h3>
          {result.standards.length > 3 && <button type="button" className="link text-xs" onClick={() => setAllStandards((v) => !v)}>{allStandards ? tx(locale, "Show less") : `${tx(locale, "Show all")} ${result.standards.length}`}</button>}
        </div>
        <ul className="mt-1 divide-y divide-rule">
          {result.standards.slice(0, allStandards ? undefined : 3).map((s) => (
            <li key={s.id} className="grid gap-1 py-2 sm:grid-cols-[145px_1fr]">
              <Link href={standardHref(s.code)}><StandardCode code={s.code} link={false} /></Link>
              <span className="text-sm"><span className="font-medium text-ink">{s.title}</span><span className="hidden text-muted sm:inline"> — {s.summary}</span></span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="path-h" className="sheet px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 id="path-h" className="font-semibold">{tx(locale, "Certification pathway")}</h3>
          {certId && <Link href={`/certification?scheme=${certId}`} className="link text-xs">{tx(locale, "Full guide")}</Link>}
        </div>
        <div role="tablist" aria-label={tx(locale, "Certification stages")} className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-5">
          {steps.map((s, i) => (
            <button key={s.title} type="button" role="tab" aria-selected={stage === i} tabIndex={stage === i ? 0 : -1}
              onKeyDown={(e) => { if (e.key === "ArrowRight") setStage(Math.min(steps.length - 1, i + 1)); if (e.key === "ArrowLeft") setStage(Math.max(0, i - 1)); }}
              onClick={() => setStage(i)} className={`rounded-md border px-2 py-2 text-left text-xs ${stage === i ? "border-select bg-select-soft text-select-ink" : "border-rule bg-surface text-muted"}`}>
              <span className="mr-1 font-semibold">{i + 1}.</span>{tx(locale, s.title)}
            </button>
          ))}
        </div>
        {current && <div role="tabpanel" className="mt-3 border-l-2 border-select pl-3"><p className="font-medium text-ink">{tx(locale, current.title)}</p><p className="mt-1 text-sm text-body">{tx(locale, current.desc)}</p></div>}
        <div className="mt-3 flex justify-between">
          <button type="button" className="btn btn-secondary btn-sm" disabled={stage === 0} onClick={() => setStage((n) => n - 1)}><ArrowLeft className="size-3" />{tx(locale, "Back")}</button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={stage === steps.length - 1} onClick={() => setStage((n) => n + 1)}>{tx(locale, "Next")}<ArrowRight className="size-3" /></button>
        </div>
      </section>

      <section aria-labelledby="labs-h" className="sheet px-4 py-3">
        <div className="flex items-center justify-between gap-3"><h3 id="labs-h" className="font-semibold">{tx(locale, "Labs that can test it")}</h3><Link href={`/labs?capability=${p.category}`} className="link text-xs">{tx(locale, "Open filtered labs")}</Link></div>
        <ul className="mt-1 divide-y divide-rule">
          {result.labs.slice(0, allLabs ? undefined : 3).map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-1 py-2 text-sm"><span className="font-medium text-ink">{l.name}</span><span className="text-muted">{l.city}, {l.state}</span></li>)}
        </ul>
        {result.labs.length > 3 && <button type="button" className="link mt-2 text-xs" onClick={() => setAllLabs((v) => !v)}>{allLabs ? tx(locale, "Show less") : tx(locale, "Show more")}</button>}
        <details className="mt-3 border-t border-rule pt-2 text-sm"><summary className="cursor-pointer font-medium text-ink">{tx(locale, "Sources")}</summary><p className="mt-2 text-muted">{tx(locale, `Catalogue records for ${result.standards.length} standards and ${result.labs.length} facilities; curated ${categoryLabel(p.category)} product profile.`)}</p></details>
      </section>
    </div>
  );
}

export function FinderClient() {
  const { locale } = useLocale();
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [query, setQuery] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [data, setData] = useState<Response | null>(null);
  const [match, setMatch] = useState(0);
  const ran = useRef<string | null>(null);
  const inputId = useId();

  const run = useCallback(async (raw: string) => {
    const text = raw.trim(); if (!text) return;
    setQuery(text); setStatus("loading"); setMatch(0);
    try {
      const res = await fetch("/api/finder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text }) });
      if (!res.ok) throw new Error();
      const next = await res.json() as Response;
      if (!next.matched) { router.replace(`/assistant?q=${encodeURIComponent(text)}`, { scroll: false }); return; }
      setData(next); setStatus("ready");
    } catch { setStatus("error"); }
  }, [router]);

  useEffect(() => { if (!initial || ran.current === initial) return; ran.current = initial; run(initial); }, [initial, run]);
  const submit = (value: string) => { const text = value.trim(); if (!text) return; setQ(text); ran.current = text; router.replace(`/assistant?mode=identify&q=${encodeURIComponent(text)}`, { scroll: false }); run(text); };

  return (
    <div className="mx-auto max-w-[980px] px-5 pb-10 sm:px-8">
      <header className="mb-5"><h1 className="text-2xl font-bold">{tx(locale, "Check a product")}</h1><p className="mt-1 text-sm text-muted">{tx(locale, "Enter a product name or ask a standards question.")}</p></header>
      <form onSubmit={(e) => { e.preventDefault(); submit(q); }} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">{tx(locale, "Product or question")}</label><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><input id={inputId} className="field py-3 pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx(locale, "e.g. pressure cooker or Is ISI mandatory for helmets?")} /></div><button className="btn btn-primary h-auto" disabled={!q.trim() || status === "loading"}>{tx(locale, "Check")}</button>
      </form>
      {status === "idle" && <div className="mt-4 flex flex-wrap gap-2">{PRESETS.map((p) => <button key={p} type="button" onClick={() => submit(p)} className="choice">{p}</button>)}</div>}
      <div className="mt-5" aria-live="polite">{status === "loading" && <Spinner label={`${tx(locale, "Checking")} “${query}”`} />}{status === "error" && <Notice tone="danger" title={tx(locale, "Could not check this product.")}><button className="link" onClick={() => run(query)}>{tx(locale, "Try again")}</button></Notice>}{status === "ready" && data?.matched && <><div className="mb-3 flex flex-wrap gap-2">{data.results.map((r, i) => <button key={r.profile.id} type="button" aria-pressed={match === i} className="choice" onClick={() => setMatch(i)}>{r.profile.label}</button>)}</div><Pathway result={data.results[match]} query={query} /></>}</div>
    </div>
  );
}
