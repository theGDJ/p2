import Link from "next/link";
import { Nav, Footer } from "@/components/Chrome";
import { HomeSearch } from "@/components/HomeSearch";
import { TierLabel } from "@/components/ui";
import { RotatingStandardRecord, type RotatingStandard } from "@/components/RotatingStandardRecord";
import { db } from "@/db";
import { standards, labs } from "@/db/schema";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { SCHEMES } from "@/app/certification/data";
import { formatCount } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import { getLocale } from "@/lib/server-locale";
import { tx } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const AUDIENCES = [
  {
    who: "Manufacturers and MSMEs",
    question: "Does my product need a QCO and an ISI licence?",
    href: "/assistant?mode=identify",
    tool: "Check a product",
  },
  {
    who: "Importers and foreign manufacturers",
    question: "Do I need CRS or FMCS before I import?",
    href: "/certification?scheme=fmcs",
    tool: "Certification routes",
  },
  {
    who: "Compliance and quality teams",
    question: "Which parts of IS 1786 should I check?",
    href: "/standards",
    tool: "Standards catalogue",
  },
  {
    who: "Buyers and consumers",
    question: "Is this licence number or HUID genuine?",
    href: "/consumer",
    tool: "Verify a mark",
  },
];

const TIERS = [
  {
    tier: "record" as const,
    body: "Standard codes, titles, obligations, schemes, clauses and laboratories are rendered directly from catalogue rows. Nothing in this layer is generated.",
  },
  {
    tier: "extract" as const,
    body: "Guidance on schemes, fees and procedures is quoted from knowledge-base articles, with the article named.",
  },
  {
    tier: "model" as const,
    body: "A short summary written by a language model running on this server, from the records above. It is marked as such and never replaces them.",
  },
];

async function loadHome() {
  const [[stdCount], [mandCount], [labCount], stateRows] = await Promise.all([
    db.select({ c: sql<number>`count(*)::int` }).from(standards),
    db.select({ c: sql<number>`count(*)::int` }).from(standards).where(isNotNull(standards.qco)),
    db.select({ c: sql<number>`count(*)::int` }).from(labs),
    db.selectDistinct({ s: labs.state }).from(labs),
  ]);

  /* one real record for the hero: helmets if present, else any QCO standard with clauses */
  let [specimen] = await db.select().from(standards).where(eq(standards.code, "IS 4151:2015")).limit(1);
  if (!specimen) {
    [specimen] = await db
      .select()
      .from(standards)
      .where(and(isNotNull(standards.qco), sql`jsonb_array_length(${standards.sections}) > 1`))
      .limit(1);
  }

  const otherRecords = await db
    .select({
      code: standards.code,
      title: standards.title,
      category: standards.category,
      mandatory: standards.mandatory,
      scheme: standards.scheme,
      qco: standards.qco,
      sections: standards.sections,
    })
    .from(standards)
    .where(specimen ? ne(standards.code, specimen.code) : undefined)
    .orderBy(sql`random()`)
    .limit(19);
  const records: RotatingStandard[] = [
    ...(specimen ? [specimen] : []),
    ...otherRecords,
  ];

  return {
    standards: Number(stdCount?.c ?? 0),
    mandatory: Number(mandCount?.c ?? 0),
    labs: Number(labCount?.c ?? 0),
    states: stateRows.length,
    records,
  };
}

export default async function Home() {
  const locale = await getLocale();
  const data = await loadHome();

  return (
    <>
      <Nav />
      <main id="main">
        {/* ------------------------------------------------------------ hero */}
        <section className="border-b border-rule">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 pb-16 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-20">
            <div className="lg:col-span-7">
              <h1 className="max-w-[19ch] text-[2rem] font-bold leading-[1.08] tracking-[-0.035em] sm:text-3xl lg:text-[2.8rem] lg:leading-[1.06]">
                {tx(locale, "Type it. Check it. Certify it.")}
              </h1>
              <p className="mt-6 max-w-[56ch] text-md text-muted sm:text-[1.125rem] sm:leading-[1.7]">
                {tx(locale, "Enter a product name or ask in English or Hindi. Find its standard, whether BIS certification is required, the steps to follow and a lab that can test it.")}
              </p>
              <div className="mt-9 max-w-[640px]">
                <HomeSearch />
              </div>
            </div>

            {/* a real catalogue row, set as a reference specimen */}
            {data.records.length > 0 && (
              <aside aria-labelledby="specimen-title" className="lg:col-span-5 lg:pt-3">
                <RotatingStandardRecord records={data.records} locale={locale} />
              </aside>
            )}
          </div>
        </section>

        {/* ---------------------------------------------- coverage, as prose */}
        <section aria-label={tx(locale, "Catalogue coverage")} className="border-b border-rule bg-sunken">
          <p className="mx-auto max-w-[1240px] px-5 py-6 text-base text-body sm:px-8">
            {tx(locale, "Browse")} {" "}
            <Link href="/standards" className="link">
              {formatCount(data.standards)} {tx(locale, "Indian Standards")}
            </Link>
            ; {" "}
            <Link href="/standards?mandatory=true" className="link">
              {formatCount(data.mandatory)} {tx(locale, "standards are covered by QCOs")}
            </Link>
            , {" "}
            <Link href="/labs" className="link">
              {formatCount(data.labs)} {tx(locale, "labs across")}
            </Link>{" "}
            {data.states} {tx(locale, "states and union territories.")}
          </p>
        </section>

        {/* --------------------------------------------------------- audience */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">
              {tx(locale, "For makers, buyers and product teams")}
            </h2>
            <p className="mt-4 max-w-[40ch] text-base text-muted">
              {tx(locale, "Find a standard, follow a certification process or contact a testing lab.")}
            </p>
          </div>
          <ul className="divide-y divide-rule border-y border-rule lg:col-span-8">
            {AUDIENCES.map((a) => (
              <li key={a.who}>
                <Link
                  href={a.href}
                  className="group grid gap-1 py-5 sm:grid-cols-[200px_1fr_auto] sm:items-baseline sm:gap-6"
                >
                  <span className="font-heading text-base font-semibold text-ink">{tx(locale, a.who)}</span>
                  <span className="text-base text-body">“{tx(locale, a.question)}”</span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-select-ink">
                    {tx(locale, a.tool)}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ----------------------------------------------------- trust model */}
        <section className="border-y border-rule bg-surface">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">
                {tx(locale, "Know where each answer comes from")}
              </h2>
              <p className="mt-4 max-w-[46ch] text-base text-muted">
                {tx(locale, "We search standards, BIS guidance and testing labs. Each answer shows which information comes from records and which part is a summary.")}
              </p>
              <p className="mt-4 max-w-[46ch] text-base text-muted">
                {tx(locale, "The language model runs here. Your questions are not sent to another AI service.")}
              </p>
            </div>
            <ol className="space-y-7 lg:col-span-6 lg:col-start-7">
              {TIERS.map((t) => (
                <li key={t.tier} className={`ev ev-${t.tier}`}>
                  <TierLabel tier={t.tier} />
                  <p className="mt-1.5 max-w-[56ch] text-base text-body">{tx(locale, t.body)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------------------------------------------------------- routes */}
        <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">{tx(locale, "Certification routes")}</h2>
              <p className="mt-3 max-w-[60ch] text-base text-muted">
                {tx(locale, "The right process depends on the product, where it is made and whether a QCO applies.")}
              </p>
            </div>
            <Link href="/certification" className="link shrink-0 text-sm">
              {tx(locale, "Compare all routes")}
            </Link>
          </div>
          <div className="mt-8 overflow-hidden rounded-lg border border-rule bg-surface">
            <table className="w-full border-collapse text-left">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-rule bg-sunken text-xs text-muted">
                  <th scope="col" className="px-5 py-2.5 font-medium">{tx(locale, "Route")}</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">{tx(locale, "In short")}</th>
                  <th scope="col" className="px-5 py-2.5 font-medium">{tx(locale, "Typical timeline")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {SCHEMES.map((sc) => (
                  <tr key={sc.id} className="block px-5 py-4 md:table-row md:p-0">
                    <th scope="row" className="block text-left md:table-cell md:w-[30%] md:px-5 md:py-4 md:align-top">
                      <Link href={`/certification?scheme=${sc.id}`} className="link font-heading text-base font-semibold">
                        {tx(locale, sc.name)}
                      </Link>
                    </th>
                    <td className="mt-1 block text-sm text-body md:table-cell md:px-5 md:py-4 md:align-top">
                      {tx(locale, sc.tagline)}
                    </td>
                    <td className="mt-1 block text-sm text-muted md:table-cell md:w-[24%] md:px-5 md:py-4 md:align-top">
                      {tx(locale, sc.timeline)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
