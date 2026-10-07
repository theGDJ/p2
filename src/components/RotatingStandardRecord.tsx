"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ObligationTag, StandardCode, TierLabel } from "@/components/ui";
import { categoryLabel, standardHref } from "@/lib/format";
import { tx, type Locale } from "@/lib/i18n";
import type { StandardSection } from "@/db/schema";

export type RotatingStandard = {
  code: string;
  title: string;
  category: string;
  mandatory: boolean;
  scheme: string;
  qco: string | null;
  sections: StandardSection[];
};

function StandardCard({ record, locale }: { record: RotatingStandard; locale: Locale }) {
  const headingId = `specimen-title-${record.code.replace(/[^a-zA-Z0-9]/g, "-")}`;
  return (
    <div className="w-1/2 shrink-0 px-5 pb-5 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <StandardCode code={record.code} className="text-[15px]" />
        <ObligationTag mandatory={record.mandatory} scheme={record.scheme} />
      </div>
      <h2 id={headingId} className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em]">{record.title}</h2>
      {locale === "hi" && (
        <p className="mt-1 text-sm text-muted">
          {tx(locale, "Category")}: {tx(locale, categoryLabel(record.category))}. {tx(locale, record.mandatory ? "This standard is mandatory under a QCO." : "This is a voluntary standard.")} {tx(locale, "Official standard titles are shown in English.")}
        </p>
      )}
      <dl className="mt-4 grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-muted">{tx(locale, "Scheme")}</dt>
        <dd className="text-ink">{record.scheme}</dd>
        {record.qco && <>
          <dt className="text-muted">{tx(locale, "Legal basis")}</dt>
          <dd className="text-ink">{record.qco}</dd>
        </>}
      </dl>
      {record.sections.length > 0 && (
        <ol className="mt-5 space-y-3 border-t border-rule pt-4">
          {record.sections.slice(0, 2).map((section) => (
            <li key={section.clause} className="grid grid-cols-[44px_1fr] gap-2 text-sm">
              <span className="id pt-px text-xs text-muted">{section.clause}</span>
              <span>
                <span className="font-semibold text-ink">{section.title}.</span>{" "}
                <span className="text-body">{section.summary}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      <Link href={standardHref(record.code)} className="link mt-5 inline-flex items-center gap-1.5 text-sm">
        {tx(locale, "Open the full record")}
      </Link>
    </div>
  );
}

export function RotatingStandardRecord({ records, locale }: { records: RotatingStandard[]; locale: Locale }) {
  const [index, setIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (records.length < 2 || paused || nextIndex !== null) return;
    const timer = window.setTimeout(() => setNextIndex((current) => current ?? (index + 1) % records.length), 5_000);
    return () => window.clearTimeout(timer);
  }, [index, nextIndex, paused, records.length]);

  useEffect(() => {
    if (nextIndex === null) return;
    const timer = window.setTimeout(() => {
      setIndex(nextIndex);
      setNextIndex(null);
      setTransitionEnabled(false);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)));
    }, 700);
    return () => window.clearTimeout(timer);
  }, [nextIndex]);

  const record = records[index];
  if (!record) return null;
  const next = nextIndex === null ? null : records[nextIndex];
  const move = (offset: number) => {
    setNextIndex((current) => current ?? (index + offset + records.length) % records.length);
  };

  return (
    <figure aria-live="off">
      <div className="sheet overflow-hidden">
        <div className="flex items-center justify-between border-b border-rule bg-sunken px-5 py-2.5">
          <TierLabel tier="record" />
          <span className="text-2xs text-muted">{tx(locale, "Live from the catalogue")}</span>
        </div>
        <div className="overflow-hidden">
          <div
            className={`flex w-[200%] ${transitionEnabled ? "transition-transform duration-700 ease-in-out" : "transition-none"} motion-reduce:transition-none`}
            style={{ transform: next ? "translateX(-50%)" : "translateX(0)" }}
            aria-labelledby={`specimen-title-${record.code.replace(/[^a-zA-Z0-9]/g, "-")}`}
          >
            <StandardCard record={record} locale={locale} />
            {next && <StandardCard record={next} locale={locale} />}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <figcaption className="max-w-[46ch] text-xs text-muted">
          {tx(locale, "We show catalogue facts and label any text written by the model.")}
        </figcaption>
        {records.length > 1 && (
          <div className="flex items-center gap-1" role="group" aria-label={tx(locale, "Standard rotation controls")}>
            <span className="mr-1 text-xs tabular-nums text-muted" aria-live="off">{index + 1}/{records.length}</span>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => move(-1)} disabled={nextIndex !== null} aria-label={tx(locale, "Previous standard")}>
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setPaused((value) => !value)} aria-pressed={paused} aria-label={tx(locale, paused ? "Resume rotation" : "Pause rotation")}>
              {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
            </button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => move(1)} disabled={nextIndex !== null} aria-label={tx(locale, "Next standard")}>
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </figure>
  );
}
