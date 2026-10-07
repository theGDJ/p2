/* One-shot bootstrap for development/demo databases.
 *
 * - pglite://…  : applies the DDL and seeds the knowledge base if empty.
 * - postgres://…: checks the connection and reports whether tables are seeded
 *                 (schema itself comes from `npm run db:push` / db:seed).
 */
import "dotenv/config";
import { DDL } from "../src/db/ddl";

const MICROWAVE_CRS_SCHEME = "Compulsory Registration Scheme (CRS / Scheme-II)";
const MICROWAVE_STANDARD = "IS 302-2-25:2014";
const LEGACY_DEMO_CRS_NUMBERS = [
  ["R-99000001", "R-41003456812"], ["R-99000002", "R-41008720411"],
  ["R-99000003", "R-41011900782"], ["R-99000004", "R-41002551094"],
  ["R-99000101", "R-41005678901"], ["R-99000102", "R-41006234578"],
  ["R-99000103", "R-41007321904"], ["R-99000104", "R-41008765430"],
  ["R-99000105", "R-41009112233"], ["R-99000106", "R-41002445566"],
  ["R-99000107", "R-41003557788"], ["R-99000108", "R-41004669900"],
  ["R-99000109", "R-41005771122"], ["R-99000110", "R-41006882233"],
  ["R-99000111", "R-41007993344"], ["R-99000112", "R-41008104455"],
] as const;

async function fixMicrowaveScheme(client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) {
  await client.query(
    "UPDATE standards SET scheme = $1, qco = NULL, mandatory = TRUE WHERE code = $2",
    [MICROWAVE_CRS_SCHEME, MICROWAVE_STANDARD],
  );
}

async function fixDemoCrsNumbers(client: { query: (sql: string, params?: unknown[]) => Promise<unknown> }) {
  for (const [current, legacy] of LEGACY_DEMO_CRS_NUMBERS) {
    await client.query("UPDATE licences SET mark_no = $1 WHERE mark_no = $2", [current, legacy]);
  }
}

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("pglite://")) {
    const dir = url.slice("pglite://".length) || ".data/pglite";
    // PGlite creates the data directory but not its parents (.data/ on a fresh clone)
    const { mkdirSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    mkdirSync(dirname(dir), { recursive: true });
    const { PGlite } = await import("@electric-sql/pglite");
    const path = await import("node:path");
    const client = new PGlite(path.resolve(process.cwd(), dir));
    await client.waitReady;
    await client.exec(DDL);
    await fixMicrowaveScheme(client);
    await fixDemoCrsNumbers(client);
    const { rows } = await client.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM standards",
    );
    if (Number(rows[0].n) === 0 && process.env.AUTO_SEED !== "0") {
      const { seed } = await import("../src/db/seed");
      const { drizzle } = await import("drizzle-orm/pglite");
      await seed(drizzle(client) as never);
    } else {
      console.log("[db:init] pglite already seeded, nothing to do.");
    }
    await client.close();
    console.log("[db:init] done.");
    return;
  }

  const { default: pg } = await import("pg");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const res = await client.query(
    "SELECT to_regclass('standards') IS NOT NULL AS exists",
  );
  if (res.rows[0].exists) {
    await fixMicrowaveScheme(client);
    await fixDemoCrsNumbers(client);
    const c = await client.query<{ n: string }>(
      "SELECT count(*)::int AS n FROM standards",
    );
    console.log(`[db:init] postgres reachable; standards rows: ${c.rows[0].n}`);
  } else {
    console.log("[db:init] postgres reachable; schema missing — run `npm run db:push && npm run db:seed`.");
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
