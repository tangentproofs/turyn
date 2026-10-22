// Pure quiz / progress logic, shared by app.js and tested by tools/test_app.mjs.

/** Normalise free text for comparison: case, whitespace, backticks and quotes don't matter;
 *  Unicode minus/dashes count as '-', and ≤/≥/≠/→ have ASCII spellings. */
export function normText(s) {
  return String(s ?? "").normalize("NFKC").toLowerCase()
    .replace(/[\u2212\u2012\u2013\u2014\uFE63\uFF0D]/g, "-")
    .replace(/<=/g, "≤").replace(/>=/g, "≥").replace(/!=/g, "≠").replace(/->/g, "→")
    .replace(/[`'"\u2018\u2019\u201C\u201D]/g, "").replace(/\s+/g, "");
}

/** Parse a typed number: accepts Unicode minus, a leading '+', surrounding spaces, and thousands
 *  separators ("1,536"). Returns NaN when it is not a plain number. */
export function parseNumber(s) {
  const t = String(s ?? "").trim().replace(/[\u2212\u2012\u2013\u2014\uFE63\uFF0D]/g, "-").replace(/(\d),(?=\d{3}\b)/g, "$1").replace(/^\+/, "");
  if (!/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(t)) return NaN;
  return Number(t);
}

/** Is `given` a correct answer to question `q` ({type, answer})? null/"" counts as unanswered (false). */
export function isCorrect(q, given) {
  if (given == null || given === "") return false;
  if (q.type === "choice") return Number(given) === q.answer;
  if (q.type === "number") { const v = parseNumber(given); return !Number.isNaN(v) && v === q.answer; }
  return (q.answer || []).some((a) => normText(a) === normText(given));
}

/** Validate an imported / stored progress object; returns a clean object that keeps its schema
 *  version (1 or 2; anything else counts as 1) and never throws. Run migrateProgress (progress.js) after. */
export function sanitizeProgress(p) {
  const out = { v: p && p.v === 2 ? 2 : 1, nodes: {} };
  if (!p || typeof p !== "object" || typeof p.nodes !== "object" || p.nodes === null || Array.isArray(p.nodes)) return out;
  for (const [id, r] of Object.entries(p.nodes)) {
    if (!r || typeof r !== "object" || Array.isArray(r)) continue;
    const c = {};
    for (const k of ["viewed", "quizPassed", "signedOff"]) if (typeof r[k] === "number" && Number.isFinite(r[k])) c[k] = r[k];
    if (r.answers && typeof r.answers === "object" && !Array.isArray(r.answers)) c.answers = r.answers;
    out.nodes[id] = c;
  }
  return out;
}
/** True when `p` looks like a progress file at all (used to reject unrelated JSON on import). */
export const looksLikeProgress = (p) => !!p && typeof p === "object" && (p.v === 1 || p.v === 2) && typeof p.nodes === "object" && p.nodes !== null && !Array.isArray(p.nodes);
