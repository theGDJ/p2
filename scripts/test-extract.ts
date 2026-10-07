import assert from "node:assert/strict";
import { extractMarks, normaliseIsCode } from "../src/lib/verify/extract";
import { matchesStandardCode } from "../src/lib/verify/standard-match";

const values = (text: string) => extractMarks(text).map((candidate) => candidate.normalised);

assert.deepEqual(values("ISI: CM/L-7200045182"), ["CM/L-7200045182"]);
assert.deepEqual(values("CRS R-41008720"), ["R-41008720"]);
assert.deepEqual(values("R-93035130"), ["R-93035130"]);
assert.deepEqual(values("R-41008720411"), []);
assert.deepEqual(values("Jeweller HM/C-729001188"), ["HM/C-729001188"]);
assert.deepEqual(values("Gold HUID A1B2C3"), ["A1B2C3"]);

assert.deepEqual(values("CM / L - 7200 045182"), ["CM/L-7200045182"]);
assert.deepEqual(values("CM/L7200045182"), ["CM/L-7200045182"]);
assert.deepEqual(values("CML: 7200045182"), ["CM/L-7200045182"]);
assert.deepEqual(values("R: 41008720"), ["R-41008720"]);
assert.deepEqual(values("CM/I-7200045182"), ["CM/L-7200045182"]);
assert.deepEqual(values("CMIL720OO45182"), ["CM/L-7200045182"]);
assert.deepEqual(values("R 4I008720"), ["R-41008720"]);
assert.deepEqual(values("HM / C 7290O1188"), ["HM/C-729001188"]);

assert.deepEqual(values("Product label ABC123 and more text"), []);
assert.deepEqual(values("HUID: Z9X8W7"), ["Z9X8W7"]);
assert.deepEqual(values("Where you bought it, the licence or HUID number you saw"), []);
assert.deepEqual(values("IS 694:2010 standard, mark CM/L-7200045182"), ["CM/L-7200045182"]);
assert.equal(normaliseIsCode("आईएस 2347"), "IS 2347");
assert.equal(normaliseIsCode("IS 694:2010"), "IS 694:2010");
assert.equal(normaliseIsCode("1S 13252"), "IS 13252");
assert.equal(normaliseIsCode("BIS 1915"), null);

console.log("✓ extractMarks cases passed");

assert.equal(matchesStandardCode("IS 13252", "IS 13252-1:2010"), true);
assert.equal(matchesStandardCode("IS 13252 (Part 1)", "IS 13252-1:2010"), true);
assert.equal(matchesStandardCode("IS 13252-1:2010", "IS 13252-1:2010"), true);
assert.equal(matchesStandardCode("IS 13252-2", "IS 13252-1:2010"), false);
assert.equal(matchesStandardCode("IS 13252:2020", "IS 13252-1:2010"), false);
assert.equal(matchesStandardCode("IS 13252", "IS 132520:2010"), false);
assert.equal(matchesStandardCode("R-81013900", "IS 13252-1:2010"), false);
console.log("✓ catalogue code matching cases passed");
