"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ChevronDown, X } from "lucide-react";
import { COMPARISON, FAQS, INDICATIVE_NOTE, SCHEMES } from "./data";
import { useLocale } from "@/lib/locale-context";
import { tx } from "@/lib/i18n";

export type CertStats = { standards: number; mandatory: number; labs: number; ahc: number; schemes: { scheme: string; count: number }[]; qcos: { qco: string; count: number }[] };
const STORAGE_KEY = "pramaan_cert_checklist";
const EVENT = "pramaan-checklist";
let rawCache: string | null = null;
let valueCache: Record<string, boolean> = {};
const EMPTY: Record<string, boolean> = {};

function readChecklist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== rawCache) { rawCache = raw; valueCache = raw ? JSON.parse(raw) : {}; }
  } catch {}
  return valueCache;
}
function subscribe(cb: () => void) { window.addEventListener("storage", cb); window.addEventListener(EVENT, cb); return () => { window.removeEventListener("storage", cb); window.removeEventListener(EVENT, cb); }; }
function write(next: Record<string, boolean>) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} window.dispatchEvent(new Event(EVENT)); }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { const key = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); }, [onClose]);
  const { locale } = useLocale();
  return <div className="fixed inset-0 z-50 grid place-items-center bg-ink/35 p-4" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section role="dialog" aria-modal="true" aria-labelledby="modal-title" className="max-h-[85vh] w-full max-w-[760px] overflow-y-auto rounded-lg border border-rule bg-canvas p-5"><div className="flex items-center justify-between gap-4"><h2 id="modal-title" className="text-xl font-bold">{title}</h2><button type="button" className="btn btn-quiet btn-sm" onClick={onClose} aria-label={tx(locale, "Close")}><X className="size-5" /></button></div>{children}</section></div>;
}

export function CertificationClient({ stats: _stats }: { stats: CertStats }) {
  const { locale } = useLocale();
  const params = useSearchParams();
  const initial = params.get("scheme");
  const [active, setActive] = useState(SCHEMES.some((s) => s.id === initial) ? initial! : "isi");
  const [step, setStep] = useState(0);
  const [modal, setModal] = useState<"documents" | "compare" | null>(null);
  const checked = useSyncExternalStore(subscribe, readChecklist, () => EMPTY);
  const scheme = SCHEMES.find((s) => s.id === active)!;
  const current = scheme.steps[step];

  useEffect(() => {
    if (location.hash !== "#documents") return;
    const frame = requestAnimationFrame(() => setModal("documents"));
    return () => cancelAnimationFrame(frame);
  }, []);
  const choose = (id: string) => { setActive(id); setStep(0); history.replaceState(null, "", `/certification?scheme=${id}`); };

  return <div className="space-y-5 pb-8">
    <div className="flex items-center gap-2 overflow-x-auto border-b border-rule pb-2" role="tablist" aria-label={tx(locale, "Certification schemes")}>
      {SCHEMES.map((s) => <button key={s.id} type="button" role="tab" aria-selected={active === s.id} onClick={() => choose(s.id)} className={`shrink-0 rounded-md px-3 py-2 text-sm ${active === s.id ? "bg-select-soft font-semibold text-select-ink" : "text-body hover:bg-sunken"}`}>{tx(locale, s.tab)}</button>)}
    </div>

    <article role="tabpanel" className="sheet px-5 py-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div><h2 className="text-xl font-bold">{tx(locale, scheme.name)}</h2><p className="mt-1 max-w-[70ch] text-sm text-body">{tx(locale, scheme.tagline)}</p><p className="mt-2 max-w-[80ch] text-sm"><span className="font-semibold text-ink">{tx(locale, "Who needs it:")}</span> {tx(locale, scheme.audience)}</p></div>
        <span className="tag shrink-0">{tx(locale, scheme.timeline)}</span>
      </div>

      <section className="mt-5 border-t border-rule pt-4" aria-labelledby="steps-title">
        <div className="flex items-center justify-between"><h3 id="steps-title" className="font-semibold">{tx(locale, "Certification steps")}</h3><span className="text-xs text-muted">{step + 1}/{scheme.steps.length}</span></div>
        <div role="tablist" aria-label={tx(locale, "Certification steps")} className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-6">
          {scheme.steps.map((s, i) => <button key={s.title} type="button" role="tab" aria-selected={step === i} tabIndex={step === i ? 0 : -1} onClick={() => setStep(i)} onKeyDown={(e) => { if (e.key === "ArrowRight") setStep(Math.min(scheme.steps.length - 1, i + 1)); if (e.key === "ArrowLeft") setStep(Math.max(0, i - 1)); }} className={`rounded-md border px-2 py-2 text-left text-xs ${step === i ? "border-select bg-select-soft text-select-ink" : "border-rule text-muted"}`}><span className="mr-1 font-semibold">{i + 1}.</span>{tx(locale, s.title)}</button>)}
        </div>
        <div role="tabpanel" className="mt-4 min-h-[86px] border-l-2 border-select pl-4"><div className="flex flex-wrap items-baseline gap-2"><h4 className="font-semibold text-ink">{tx(locale, current.title)}</h4>{current.days && <span className="text-xs text-muted">{current.days}</span>}</div><p className="mt-1 max-w-[72ch] text-sm text-body">{tx(locale, current.desc)}</p></div>
        <div className="flex justify-between"><button type="button" className="btn btn-secondary btn-sm" disabled={step === 0} onClick={() => setStep((n) => n - 1)}><ArrowLeft className="size-3" />{tx(locale, "Back")}</button><button type="button" className="btn btn-secondary btn-sm" disabled={step === scheme.steps.length - 1} onClick={() => setStep((n) => n + 1)}>{tx(locale, "Next")}<ArrowRight className="size-3" /></button></div>
      </section>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-rule pt-4"><button type="button" className="btn btn-primary" onClick={() => setModal("documents")}>{tx(locale, "Documents checklist")}</button><button type="button" className="btn btn-secondary" onClick={() => setModal("compare")}>{tx(locale, "Compare routes")}</button></div>

      <div className="mt-4 divide-y divide-rule border-y border-rule">
        <details><summary className="flex cursor-pointer items-center justify-between py-3 font-medium text-ink">{tx(locale, "Indicative fees")}<ChevronDown className="size-4" /></summary><dl className="pb-4">{scheme.fees.map((f) => <div key={f.item} className="grid grid-cols-[1fr_auto] gap-3 py-1 text-sm"><dt>{tx(locale, f.item)}</dt><dd className="font-semibold text-ink">{tx(locale, f.amount)}</dd></div>)}</dl><p className="pb-4 text-xs text-muted">{tx(locale, INDICATIVE_NOTE)}</p></details>
        <details><summary className="flex cursor-pointer items-center justify-between py-3 font-medium text-ink">{tx(locale, "Marking rules")}<ChevronDown className="size-4" /></summary><ul className="list-disc space-y-1 pb-4 pl-5 text-sm">{scheme.marking.map((m) => <li key={m}>{tx(locale, m)}</li>)}</ul></details>
        <details><summary className="flex cursor-pointer items-center justify-between py-3 font-medium text-ink">{tx(locale, "Common questions")}<ChevronDown className="size-4" /></summary><div className="space-y-3 pb-4">{FAQS.slice(0, 4).map((f) => <div key={f.q}><p className="text-sm font-semibold text-ink">{tx(locale, f.q)}</p><p className="text-sm text-body">{tx(locale, f.a)}</p></div>)}</div></details>
      </div>
    </article>

    {modal === "documents" && <Modal title={`${tx(locale, scheme.tab)} · ${tx(locale, "Documents checklist")}`} onClose={() => setModal(null)}><p className="mt-2 text-sm text-muted">{tx(locale, "Ticked items are saved in this browser.")}</p><ul className="mt-4 divide-y divide-rule border-y border-rule">{scheme.documents.map((d) => { const key = `${scheme.id}:${d}`; const on = !!checked[key]; return <li key={d}><label className="flex cursor-pointer items-start gap-3 py-3 text-sm"><input type="checkbox" checked={on} onChange={() => write({ ...checked, [key]: !on })} className="sr-only" /><span className={`mt-0.5 grid size-4 shrink-0 place-items-center border ${on ? "border-success bg-success text-white" : "border-rule-strong"}`}>{on && <Check className="size-3" />}</span><span className={on ? "text-muted line-through" : "text-body"}>{tx(locale, d)}</span></label></li>; })}</ul></Modal>}
    {modal === "compare" && <Modal title={tx(locale, "Compare certification routes")} onClose={() => setModal(null)}><div className="mt-4 overflow-x-auto"><table className="min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-rule"><th className="p-2">{tx(locale, "Route")}</th>{["ISI", "CRS", "FMCS", "Hallmark", "CoC"].map((h) => <th key={h} className="p-2">{tx(locale, h)}</th>)}</tr></thead><tbody>{COMPARISON.map((r) => <tr key={r.label} className="border-b border-rule"><th className="p-2 text-muted">{tx(locale, r.label)}</th>{r.values.map((v, i) => <td key={i} className="p-2">{tx(locale, v)}</td>)}</tr>)}</tbody></table></div></Modal>}
  </div>;
}
