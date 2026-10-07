import assert from "node:assert/strict";

async function main() {
  const base = process.argv[2] ?? "http://127.0.0.1:3000";
  const check = async (candidates: string[], isCode?: string) => {
    const response = await fetch(`${base}/api/verify/scan`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidates, isCode }),
    });
    assert.equal(response.status, 200);
    return response.json();
  };
  for (const mark of ["R-81013900", "R-93035130"]) {
    const result = await check([mark], "IS 13252");
    assert.equal(result.catalogue.status, "FOUND");
    assert.ok(result.catalogue.matches.some((s: { code: string }) => s.code === "IS 13252-1:2010"));
    assert.equal(result.catalogue.exactEdition, false);
    assert.equal(result.verdict, "NOT_FOUND");
    assert.equal(result.checks.foundInRegistry, false);
    assert.equal(result.checks.standardConsistent, null);
    console.log(`✓ ${mark}: standard found; product registration remains unverified`);
  }
  const exact = await check([], "IS 13252-1:2010");
  assert.equal(exact.catalogue.status, "FOUND");
  assert.equal(exact.catalogue.exactEdition, true);
  assert.equal(exact.verdict, "NO_MARK_DETECTED");
  assert.equal((await check(["R-81013900"])).catalogue.status, "NOT_PROVIDED");
  assert.equal((await check(["R-81013900"], "IS 132520")).catalogue.status, "NOT_FOUND");
  console.log("✓ exact edition, standard-only, absent code and unrelated code checks passed");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
