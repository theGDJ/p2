import { Suspense } from "react";
import { Nav, Footer, PageShell } from "@/components/Chrome";
import { LabsClient, type Lab } from "@/components/LabsClient";
import { Notice } from "@/components/ui";
import { db } from "@/db";
import { labs } from "@/db/schema";
import { getLocale } from "@/lib/server-locale";
import { tx } from "@/lib/i18n";
import ScrollToTop from "@/components/ScrollToTop";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laboratories",
  description:
    "BIS laboratories, recognized testing laboratories and assaying and hallmarking centres, searchable by state, capability and type.",
};

export default async function LabsPage() {
  const locale = await getLocale();
  const rows = await db.select().from(labs).orderBy(labs.state, labs.city).limit(1000);
  const states = [...new Set(rows.map((r) => r.state))].sort();
  return (
    <>
      <Nav />
      <PageShell
        title={tx(locale, "Laboratories and hallmarking centres")}
        description={tx(locale, "Find testing labs and hallmarking centres by location, type or product.")}
      >
        <div className="mb-6 max-w-[760px]">
          <Notice title={tx(locale, "Contact details in this directory are illustrative.")}>
            {tx(locale, "Facility names, locations and capabilities are curated for demonstration. Confirm contacts and the scope of recognition with the facility or the BIS branch office before sending samples.")}
          </Notice>
        </div>
        <Suspense>
          <LabsClient initial={rows as Lab[]} states={states} />
        </Suspense>
      </PageShell>
      <Footer />
      <ScrollToTop />
    </>
  );
}
