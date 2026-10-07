const queries = [
  "Which standard applies to helmets?",
  "Is certification mandatory for pressure cookers?",
  "Which standard applies to TMT steel?",
  "What standard covers packaged drinking water?",
  "Which labs test electrical cables?",
  "Does a ceiling fan need BIS certification?",
  "Which standard applies to toys?",
];
let passed = 0;
let answered = 0;
for (const message of queries) {
  const response = await fetch("http://127.0.0.1:3000/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, locale: "en" }),
  });
  if (!response.ok) { process.stdout.write(`error ${response.status}: ${message}\n`); continue; }
  answered += 1;
  const body = await response.json();
  const fallback = body.text.startsWith("Here's what the BIS knowledge base says on this:");
  if (!fallback) passed += 1;
  process.stdout.write(`${fallback ? "fallback" : "model"}: ${message}\n`);
}
process.stdout.write(`pass rate: ${passed}/${answered} successful answers (${answered ? Math.round((passed / answered) * 100) : 0}%); ${queries.length - answered} request error(s)\n`);
