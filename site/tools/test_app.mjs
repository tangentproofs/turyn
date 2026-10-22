#!/usr/bin/env node
// Regression tests for the app layer: quiz checking, progress import, quiz keys,
// declaration-graph extraction and GitHub source anchors.   node tools/test_app.mjs
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { isCorrect, normText, parseNumber, sanitizeProgress, looksLikeProgress } from "../assets/quiz.js";
import { migrateProgress, ownStatus } from "../assets/progress.js";

const SITE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPO = path.dirname(SITE);
let n = 0, groups = 0;
const group = (name, fn) => { groups++; try { fn(); } catch (e) { console.error(`FAIL ${name}:`, e.message); process.exit(1); } };
const ok = (c, m) => { n++; assert.ok(c, m); };
const eq = (a, b, m) => { n++; assert.deepEqual(a, b, m); };

group("parseNumber", () => {
  eq(parseNumber("−4"), -4, "Unicode minus (U+2212) is accepted");
  eq(parseNumber(" 428 "), 428); eq(parseNumber("+3"), 3); eq(parseNumber("1,536"), 1536);
  ok(Number.isNaN(parseNumber("")), "empty is NaN"); ok(Number.isNaN(parseNumber("0x10")), "hex rejected");
  ok(Number.isNaN(parseNumber("4 or 5")), "junk rejected");
});
group("isCorrect", () => {
  ok(isCorrect({ type: "number", answer: -4 }, "−4"));
  ok(isCorrect({ type: "number", answer: -4 }, "-4"));
  ok(!isCorrect({ type: "number", answer: 0 }, ""), "blank is not 0");
  ok(!isCorrect({ type: "number", answer: 0 }, "  "), "spaces are not 0");
  ok(isCorrect({ type: "choice", answer: 0 }, 0)); ok(!isCorrect({ type: "choice", answer: 0 }, null));
  ok(isCorrect({ type: "text", answer: ["PmSeq 36"] }, "`pmseq36`"));
  ok(isCorrect({ type: "text", answer: ["n − 1"] }, "n-1"), "dash variants");
  ok(isCorrect({ type: "text", answer: ["k ≤ n"] }, "k <= n"));
  eq(normText("“X”"), "x");
});
group("progress import", () => {
  eq(sanitizeProgress(null), { v: 1, nodes: {} }); eq(sanitizeProgress({}), { v: 1, nodes: {} });
  eq(sanitizeProgress({ v: 1, nodes: [] }), { v: 1, nodes: {} });
  eq(sanitizeProgress({ v: 1, nodes: { a: { viewed: 1, quizPassed: "x", junk: 2 }, b: 5 } }), { v: 1, nodes: { a: { viewed: 1 } } });
  ok(!looksLikeProgress({ foo: 1 })); ok(!looksLikeProgress([])); ok(looksLikeProgress({ v: 1, nodes: {} }));
  ok(looksLikeProgress({ v: 2, nodes: {} }), "v2 progress files import"); ok(!looksLikeProgress({ v: 3, nodes: {} }));
  eq(sanitizeProgress({ v: 2, nodes: { a: { signedOff: 4 } } }), { v: 2, nodes: { a: { signedOff: 4 } } }, "v2 kept, so its sign-off is not migrated");
  const v1 = migrateProgress(sanitizeProgress({ v: 1, nodes: { a: { signedOff: 4 }, b: { quizPassed: 3 } } }));
  eq([v1.v, ownStatus(v1.nodes.a, true), ownStatus(v1.nodes.b, true)], [2, "both", "quiz"], "stored v1 sign-off → both after load");
});

const decls = JSON.parse(fs.readFileSync(path.join(SITE, "data/decls.json"), "utf8"));
const byId = new Map(decls.map((d) => [d.id, d]));
const nodes = fs.readdirSync(path.join(SITE, "nodes")).filter((f) => f.endsWith(".md"))
  .map((f) => yaml.load(fs.readFileSync(path.join(SITE, "nodes", f), "utf8").match(/^---\n([\s\S]*?)\n---\n/)[1]));

group("every quiz key passes its own checker", () => {
  for (const fm of nodes) fm.quiz.forEach((q, i) => {
    const where = `${fm.id} quiz[${i}]`;
    if (q.type === "text") for (const a of q.answer) ok(isCorrect(q, a), `${where}: accepted answer '${a}' fails the checker`);
    else ok(isCorrect(q, q.type === "number" ? String(q.answer) : q.answer), `${where}: key fails the checker`);
    if (q.type === "number") ok(Number.isFinite(q.answer), `${where}: non-finite number`);
  });
});

group("declaration graph", () => {
  // Regression: dependencies used only inside auto-generated `proof_N` / `_private` auxiliaries
  // used to be dropped by ExtractDecls.lean.
  ok(byId.get("gsDataOfTSequence").proofDeps.includes("tseqCombine_periodic_identity"),
    "gsDataOfTSequence → tseqCombine_periodic_identity edge (via a proof_ auxiliary)");
  ok(byId.get("tseqCombine_periodic_identity").depth != null, "tseqCombine_periodic_identity is reachable");
  for (const d of decls) {
    for (const e of [...d.meaningDeps, ...d.proofDeps]) {
      ok(byId.has(e), `${d.id}: edge to unknown '${e}'`);
      ok(!/(^|\.)(proof_\d+|_private|match_\d+|eq_\d+)(\.|$)/.test(e), `${d.id}: auxiliary leaked into the graph: ${e}`);
      ok(byId.get(e).usedBy.includes(d.id), `${e}.usedBy misses ${d.id}`);
      if (d.depth != null) ok(byId.get(e).depth != null && byId.get(e).depth <= d.depth + 1, `${d.id} → ${e}: depth not propagated`);
    }
    ok(!d.meaningDeps.includes(d.id) && !d.proofDeps.includes(d.id), `${d.id}: self edge`);
  }
});

group("SPINE / HEADLINES ids exist and are explained", () => {
  const app = fs.readFileSync(path.join(SITE, "assets/app.js"), "utf8");
  const ids = (name) => JSON.parse(app.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\]);`))[1]);
  const explained = new Set(nodes.map((x) => x.id));
  for (const id of [...ids("SPINE"), ...ids("HEADLINES")]) { ok(byId.has(id), `${id} not a decl`); ok(explained.has(id), `${id} has no node`); }
});

group("GitHub source anchors point at the declaration", () => {
  const cache = new Map();
  for (const d of decls) {
    const f = path.join(REPO, d.file);
    ok(fs.existsSync(f), `${d.id}: ${d.file} missing`);
    if (!cache.has(f)) cache.set(f, fs.readFileSync(f, "utf8").split("\n"));
    const lines = cache.get(f);
    ok(d.line >= 1 && d.endLine >= d.line && d.endLine <= lines.length, `${d.id}: #L${d.line}-L${d.endLine} out of range (${lines.length})`);
    const short = d.name.split(".").pop();
    if (!/^(inst[A-Z]|term)/.test(short)) ok(lines.slice(d.line - 1, d.endLine).join("\n").includes(short), `${d.id}: '${short}' not found in ${d.file}#L${d.line}-L${d.endLine}`);
  }
});

console.log(`ok: ${groups} groups, ${n} assertions`);
