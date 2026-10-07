import { NextRequest, NextResponse } from "next/server";
import { ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import { licences, standards } from "@/db/schema";
import { matchesStandardCode, parseStandardCode } from "@/lib/verify/standard-match";
import { MARK_PATTERNS, type MarkType } from "@/lib/verify/extract";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_CANDIDATES = 5;
type Verdict = "VALID_IN_REGISTRY" | "SUSPENDED" | "EXPIRED" | "NOT_FOUND" | "NO_MARK_DETECTED";

function withinValidity(issuedOn: string, validTill: string): boolean {
  const parse = (value: string): number | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const time = Date.parse(value + "T00:00:00.000Z");
    return Number.isFinite(time) ? time : null;
  };
  const issued = parse(issuedOn);
  const valid = parse(validTill);
  if (issued === null || valid === null) return false;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return issued <= todayUtc && todayUtc <= valid;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return badRequest("Content-Type must be application/json.");

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) return badRequest("Request body is too large.");

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return badRequest("Request body could not be read.");
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES)
    return badRequest("Request body is too large.");

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return badRequest("Request body must be valid JSON.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return badRequest("Request body must be a JSON object.");

  const payload = body as { candidates?: unknown; isCode?: unknown };
  if (!Array.isArray(payload.candidates) || payload.candidates.length > MAX_CANDIDATES)
    return badRequest("Candidates must be an array with at most five entries.");
  if (payload.candidates.some((candidate) => typeof candidate !== "string"))
    return badRequest("Every candidate must be a string.");
  if (payload.isCode !== undefined && typeof payload.isCode !== "string")
    return badRequest("isCode must be a string.");

  const candidates = [...new Set((payload.candidates as string[]).map((x) => x.trim().toUpperCase()).filter(Boolean))];
  const typedIsCode = (payload.isCode as string | undefined)?.trim();
  if (typedIsCode && typedIsCode.length > 80) return badRequest("isCode is too long.");

  const typed = candidates
    .map((markNo) => {
      const type = (Object.keys(MARK_PATTERNS) as MarkType[]).find((key) => MARK_PATTERNS[key].test(markNo));
      return type ? { markNo, type } : null;
    })
    .filter((x): x is { markNo: string; type: MarkType } => x !== null);
  const validNumbers = typed.map((x) => x.markNo);
  const formatValid = typed.length > 0;
  const rows = validNumbers.length
    ? await db.select().from(licences).where(inArray(licences.markNo, validNumbers)).limit(MAX_CANDIDATES)
    : [];
  const matching = rows;
  const parsedCode = typedIsCode ? parseStandardCode(typedIsCode) : null;
  const catalogueRows = parsedCode
    ? await db.select({ code: standards.code, title: standards.title }).from(standards)
      .where(ilike(standards.code, `IS ${parsedCode.number}%`)).orderBy(standards.code)
    : [];
  const catalogueMatches = catalogueRows.filter((row) => matchesStandardCode(typedIsCode!, row.code));
  const foundInRegistry = matching.length > 0;
  const statusActive = matching.some((row) => row.status.toLowerCase() === "valid");
  const withinValidityCheck = matching.some((row) => withinValidity(row.issuedOn, row.validTill));
  const standardConsistent = typedIsCode && matching.some((row) => row.standardCode)
    ? matching.some((row) => row.standardCode && matchesStandardCode(typedIsCode, row.standardCode))
    : null;

  let verdict: Verdict;
  if (candidates.length === 0) verdict = "NO_MARK_DETECTED";
  else if (!formatValid || !foundInRegistry) verdict = "NOT_FOUND";
  else if (matching.some((row) => row.status.toLowerCase() === "suspended")) verdict = "SUSPENDED";
  else if (matching.some((row) => row.status.toLowerCase() === "expired")) verdict = "EXPIRED";
  else verdict = "VALID_IN_REGISTRY";

  return NextResponse.json({
    verdict,
    matches: matching,
    catalogue: {
      queriedCode: typedIsCode ?? null,
      status: !typedIsCode ? "NOT_PROVIDED" : catalogueMatches.length ? "FOUND" : "NOT_FOUND",
      matches: catalogueMatches,
      exactEdition: !!parsedCode?.year && catalogueMatches.some((row) => {
        const record = parseStandardCode(row.code);
        return record?.parts === parsedCode.parts;
      }),
    },
    checks: {
      formatValid,
      foundInRegistry,
      statusActive,
      withinValidity: withinValidityCheck,
      standardConsistent,
    },
  });
}
