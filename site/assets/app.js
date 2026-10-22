import { highlight, linkMap } from "./lean.js";
import { mountWidget } from "./widgets.js";
import { isCorrect, sanitizeProgress, looksLikeProgress } from "./quiz.js";

const REPO = "tangentproofs/turyn";
const BLOB = `https://github.com/${REPO}/blob/main`;
const GISCUS = { repo: REPO, repoId: "R_kgDORx30Hw", category: "Announcements", categoryId: "DIC_kwDORx30H84DJW9M" };
const MATHLIB_DOCS = (n) => `https://leanprover-community.github.io/mathlib4_docs/find/?pattern=${encodeURIComponent(n)}#doc`;
const MAIN = "Result.tt_implies_hadamard";
// The headline results: depth in decls.json is measured from all of them.
// The spine: the headline results and the declarations their statements and main proofs turn on.
// (All 130+ explained nodes are one click away under "Explained".)
const SPINE = ["Result.tt_implies_hadamard", "hadamard_428_exists", "kharaghani_2005_tt36", "tt6_valid", "tt6_hadamard",
  "tt6_hadamard_isHadamard", "energy_identity", "Result.xy_interior_antipalindrome", "canonical_representative_exists",
  "PmSeq", "AllPmOne", "lookupNat", "aperiodicAutocorr", "combinedAutocorr", "IsTurynType", "TurynType", "IntMat",
  "IsHadamardMat", "hadamardOrder", "seqSum", "totalAutocorr", "sum_sq_eq_len_add_two_totalAutocorr",
  "turyn_vanishing_total", "weightedTotalAutocorr_decompose", "IsTurynType.toTyped", "step2", "TSequence",
  "periodicAutocorr", "tseqCombine_periodic_identity", "gsDataOfTSequence", "gsMatrix", "circulant",
  "typedGsMatrix_isHadamard", "turynToHadamardMatrix", "turynToHadamardMatrix_isHadamard", "ofIsTurynTypeMatrix",
  "ofIsTurynTypeMatrix_isHadamard", "uAt", "Canonical1", "Canonical", "Equivalent", "Elementary", "xy_product_law",
  "step1", "BaseSeqData"];
const HEADLINES = ["Result.tt_implies_hadamard", "hadamard_428_exists", "tt6_hadamard_isHadamard", "energy_identity", "Result.xy_interior_antipalindrome", "canonical_representative_exists"];
const app = document.getElementById("app");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const [decls, nodes] = await Promise.all([
  fetch("data/decls.json").then((r) => r.json()),
  fetch("data/nodes.json").then((r) => r.json()),
]);
const byId = new Map(decls.map((d) => [d.id, d]));
const reachable = decls.filter((d) => d.depth !== null);
// Everything a declaration's statement mentions, transitively (computed, so prose never drifts from the graph).
const meaningClosure = (id) => { const seen = new Set(), st = [id]; while (st.length) for (const x of byId.get(st.pop())?.meaningDeps || []) if (!seen.has(x)) { seen.add(x); st.push(x); } return seen; };
const fileCount = new Set(decls.map((d) => d.file)).size;

// ------------------------------------------------------------------ progress
// localStorage schema v1: { v: 1, nodes: { [id]: { viewed?, quizPassed?, signedOff?, answers? } } }
const KEY = "turyn-progress-v1";
let P = (() => { try { return sanitizeProgress(JSON.parse(localStorage.getItem(KEY))); } catch { return { v: 1, nodes: {} }; } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch { /* storage full or disabled: keep in memory */ } };
const rec = (id) => (P.nodes[id] ??= {});

// signed: sign-off recorded AND the node's quiz passed (stubs have no quiz, so cannot be signed).
const signed = (id) => !!(nodes[id] && P.nodes[id]?.signedOff && P.nodes[id]?.quizPassed);
// understood: signed AND every meaning-dependency understood (Mathlib is taken as given).
const memo = new Map();
function understood(id, stack = new Set()) {
  if (memo.has(id)) return memo.get(id);
  if (stack.has(id)) return false;
  stack.add(id);
  const r = signed(id) && byId.get(id).meaningDeps.every((d) => understood(d, stack));
  stack.delete(id);
  memo.set(id, r);
  return r;
}
function status(id) {
  if (understood(id)) return "understood";
  if (signed(id)) return "signed";
  if (P.nodes[id]?.quizPassed) return "quiz";
  if (nodes[id]) return "explained";
  return "stub";
}
const STATUS_LABEL = { understood: "understood", signed: "signed off (deps pending)", quiz: "quiz passed", explained: "has explainer", stub: "needs explainer" };
const COLORS = { understood: "#a6e22e", signed: "#c3e88d", quiz: "#e6db74", explained: "#66d9ef", stub: "#75715e" };
function refresh() { memo.clear(); }

// The proof is understood when the theorem is, and every declaration its proof uses is too.
function proofCoverage() {
  const n = reachable.filter((d) => understood(d.id)).length;
  return { n, total: reachable.length };
}

// ------------------------------------------------------------------ router
const routes = [
  [/^#?\/?$/, graphPage],
  [/^#\/node\/(.+)$/, (id) => nodePage(decodeURIComponent(id))],
  [/^#\/nodes(?:\?.*)?$/, () => listPage()],
  [/^#\/playground$/, playgroundPage],
  [/^#\/about$/, aboutPage],
  [/^#\/trust$/, trustPage],
];
function route() {
  refresh();
  const hsh = location.hash || "#/";
  app.className = "";
  document.querySelectorAll("header nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === hsh));
  for (const [re, f] of routes) { const m = hsh.match(re); if (m) { f(...m.slice(1)); window.scrollTo(0, 0); return; } }
  app.innerHTML = `<p>Not found. <a href="#/">Home</a></p>`;
}
addEventListener("hashchange", route);

// ------------------------------------------------------------------ graph page
let graphView = "spine";
function graphPage() {
  app.className = "wide";
  const cov = proofCoverage();
  const spine = SPINE.filter((id) => byId.has(id));
  const explained = Object.keys(nodes);
  const spineDone = spine.filter((id) => understood(id)).length;
  app.innerHTML = `
    <div class="graph-wrap">
      <div>
        <h1>Turyn-type sequences and Hadamard matrices, in Lean, read back into English</h1>
        <p class="muted">The Lean library in <a href="https://github.com/${REPO}/tree/main/lean" target="_blank" rel="noopener"><code>lean/</code></a> proves that any Turyn-type quadruple TT(<i>n</i>) yields an explicit Hadamard matrix of order 4(3<i>n</i> − 1), and machine-checks two concrete quadruples, TT(6) and Kharaghani and Tayfeh-Rezaie's TT(36) (order 428).
        The job here is the other direction, and <b>you</b> are the checker: a node turns green when you've signed off on its formal statement <i>and</i> on everything its statement mentions, just as Lean won't accept a statement whose ingredients it doesn't know. <a href="#/trust">What was checked, and how much to trust it →</a></p>
        <div class="toolbar">
          <button data-v="spine">Explained spine (${spine.length})</button>
          <button data-v="explained">Explained (${explained.length})</button>
          <button data-v="neighborhood">Spine + direct deps</button>
          <button data-v="files">Files (${fileCount})</button>
          <button data-v="all">All declarations (${decls.length})</button>
          <input id="find" type="text" placeholder="find a declaration…" style="max-width:16rem">
        </div>
        <div id="cy"></div>
        <p class="small muted">Click a node to open it. Solid edge = used in the statement/definition (needed to <i>understand</i> it); dashed = used only in the proof. Arrows point from a declaration to what it uses.</p>
      </div>
      <aside id="side">
        <div class="panel">
          <h3>Your progress</h3>
          <div>Spine: <b>${spineDone}</b> / ${spine.length} understood <span class="small muted">(${explained.length} nodes explained in all)</span></div>
          <div class="progress-bar"><div style="width:${spine.length ? (100 * spineDone) / spine.length : 0}%"></div></div>
          <div>Everything the headline results use: <b>${cov.n}</b> / ${cov.total} declarations understood</div>
          <div class="progress-bar"><div style="width:${(100 * cov.n) / cov.total}%"></div></div>
          <ul class="small headlines">${HEADLINES.map((h) => `<li><span class="sw" style="background:${COLORS[status(h)]}"></span><a href="#/node/${encodeURIComponent(h)}">${esc(h)}</a></li>`).join("")}</ul>
          <p class="small muted">${understood(MAIN) ? "You understand the <b>statement</b> that every TT(n) gives a Hadamard matrix." : `To understand <a href="#/node/${MAIN}">tt_implies_hadamard</a>, sign off on it and on everything its statement mentions (${meaningClosure(MAIN).size} further declarations).`}</p>
        </div>
        <div class="panel legend">
          <h3>Legend</h3>
          ${Object.entries(STATUS_LABEL).map(([k, v]) => `<div><span class="sw" style="background:${COLORS[k]}"></span>${v}</div>`).join("")}
          <div><span class="sw" style="background:transparent;border:2px solid #f92672"></span>a headline result</div>
        </div>
        <div class="panel small">
          <h3>Start here</h3>
          <ol>
            <li><a href="#/node/PmSeq">PmSeq</a> — a sequence of ±1s</li>
            <li><a href="#/node/aperiodicAutocorr">aperiodicAutocorr</a> — how a sequence matches itself shifted</li>
            <li><a href="#/node/IsTurynType">IsTurynType</a> — four sequences whose mismatches cancel</li>
            <li><a href="#/node/IsHadamardMat">IsHadamardMat</a> — a ±1 matrix with orthogonal rows</li>
            <li><a href="#/node/Result.tt_implies_hadamard">tt_implies_hadamard</a> — the main theorem</li>
            <li><a href="#/node/hadamard_428_exists">hadamard_428_exists</a> — the order-428 example, and exactly what it says</li>
          </ol>
          <p><a href="#/playground">Play with sequences and matrices →</a> · <a href="#/trust">What was checked where →</a></p>
        </div>
        <div class="panel small">
          <h3>Progress file</h3>
          <button id="export">Export</button> <button id="import">Import</button> <button id="reset">Reset</button>
          <p class="muted">Stored only in this browser (localStorage).</p>
        </div>
      </aside>
    </div>`;
  app.querySelectorAll("[data-v]").forEach((b) => {
    b.classList.toggle("on", b.dataset.v === graphView);
    b.onclick = () => { graphView = b.dataset.v; graphPage(); };
  });
  wireProgressButtons();
  drawGraph(graphView);
}

function wireProgressButtons() {
  document.getElementById("export").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: "application/json" }));
    a.download = "turyn-progress.json"; a.click();
  };
  document.getElementById("import").onclick = () => {
    const i = document.createElement("input"); i.type = "file"; i.accept = ".json";
    i.onchange = async () => { try { const raw = JSON.parse(await i.files[0].text()); if (!looksLikeProgress(raw)) throw new Error("not a progress file (expected {\"v\": 1, \"nodes\": {…}})"); P = sanitizeProgress(raw); save(); route(); } catch (e) { alert("Could not read: " + e.message); } };
    i.click();
  };
  document.getElementById("reset").onclick = () => { if (confirm("Forget all sign-offs and quiz results in this browser?")) { P = { v: 1, nodes: {} }; save(); route(); } };
}

function drawGraph(view) {
  if (!window.cytoscape) { document.getElementById("cy").innerHTML = "<p class='err'>Graph library failed to load.</p>"; return; }
  if (window.cytoscapeDagre && !drawGraph.reg) { cytoscape.use(window.cytoscapeDagre); drawGraph.reg = true; }
  const els = [];
  let ids;
  if (view === "files") {
    const mods = [...new Set(decls.map((d) => d.module))];
    const modOf = new Map(decls.map((d) => [d.id, d.module]));
    const cnt = new Map(), expl = new Map(), und = new Map();
    for (const d of decls) {
      cnt.set(d.module, (cnt.get(d.module) || 0) + 1);
      if (nodes[d.id]) expl.set(d.module, (expl.get(d.module) || 0) + 1);
      if (understood(d.id)) und.set(d.module, (und.get(d.module) || 0) + 1);
    }
    for (const m of mods) {
      const u = und.get(m) || 0, c = cnt.get(m);
      const st = u === c ? "understood" : u ? "signed" : expl.get(m) ? "explained" : "stub";
      els.push({ data: { id: "m:" + m, label: `${m}\n${u}/${c}`, color: COLORS[st], size: 20 + Math.sqrt(c) * 6, file: m } });
    }
    const seen = new Set();
    for (const d of decls) for (const [deps, kind] of [[d.meaningDeps, "m"], [d.proofDeps, "p"]]) for (const x of deps) {
      const a = d.module, b = modOf.get(x);
      if (a !== b && !seen.has(a + ">" + b)) { seen.add(a + ">" + b); els.push({ data: { id: `e:${a}>${b}`, source: "m:" + a, target: "m:" + b, kind: "p" } }); }
    }
  } else {
    const spineIds = SPINE.filter((id) => byId.has(id));
    if (view === "spine") ids = new Set(spineIds);
    else if (view === "explained") ids = new Set(Object.keys(nodes));
    else if (view === "neighborhood") {
      ids = new Set(spineIds);
      for (const id of spineIds) for (const x of [...byId.get(id).meaningDeps, ...byId.get(id).proofDeps]) ids.add(x);
    } else ids = new Set(decls.map((d) => d.id));
    for (const id of ids) {
      const d = byId.get(id), st = status(id);
      els.push({ data: { id, label: id.split(".").pop(), color: COLORS[st], size: nodes[id] ? 26 : 12, main: HEADLINES.includes(id) ? 1 : 0, explained: nodes[id] ? 1 : 0 } });
    }
    for (const id of ids) {
      const d = byId.get(id);
      for (const x of d.meaningDeps) if (ids.has(x)) els.push({ data: { id: `${id}>${x}`, source: id, target: x, kind: "m" } });
      for (const x of d.proofDeps) if (ids.has(x)) els.push({ data: { id: `${id}>>${x}`, source: id, target: x, kind: "p" } });
    }
  }
  const big = els.length > 1500;
  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: els,
    wheelSensitivity: 0.3,
    style: [
      { selector: "node", style: { "background-color": "data(color)", width: "data(size)", height: "data(size)", label: "data(label)", color: "#f8f8f2", "font-size": view === "all" ? 6 : 10, "text-wrap": "wrap", "text-valign": "bottom", "text-margin-y": 3, "text-outline-color": "#1e1f1c", "text-outline-width": 2 } },
      { selector: "node[explained = 0]", style: { "font-size": view === "all" ? 0 : 7, color: "#a59f85" } },
      { selector: "node[main = 1]", style: { "border-width": 3, "border-color": "#f92672", "font-weight": "bold" } },
      { selector: "edge", style: { width: 1.2, "line-color": "#5c5b4f", "target-arrow-color": "#5c5b4f", "target-arrow-shape": "triangle", "arrow-scale": 0.7, "curve-style": big ? "haystack" : "bezier", opacity: 0.8 } },
      { selector: "edge[kind = 'p']", style: { "line-style": "dashed", opacity: 0.45 } },
      { selector: ".hl", style: { "border-width": 4, "border-color": "#fd971f" } },
      { selector: ".faded", style: { opacity: 0.12 } },
    ],
    layout: view === "all" ? { name: "cose", animate: false, nodeRepulsion: 4000, idealEdgeLength: 30, numIter: 600 }
      : { name: window.cytoscapeDagre ? "dagre" : "breadthfirst", rankDir: "TB", nodeSep: 50, rankSep: 60, animate: false },
  });
  cy.on("tap", "node", (e) => {
    const id = e.target.id();
    if (id.startsWith("m:")) { location.hash = "#/nodes?file=" + id.slice(2); return; }
    location.hash = "#/node/" + encodeURIComponent(id);
  });
  cy.on("mouseover", "node", (e) => { const n = e.target; cy.elements().addClass("faded"); n.closedNeighborhood().removeClass("faded"); });
  cy.on("mouseout", "node", () => cy.elements().removeClass("faded"));
  const find = document.getElementById("find");
  find.oninput = () => {
    cy.nodes().removeClass("hl");
    const q = find.value.trim().toLowerCase();
    if (!q) return;
    const hits = cy.nodes().filter((n) => n.id().toLowerCase().includes(q));
    hits.addClass("hl");
    if (hits.length && hits.length < 30) cy.fit(hits, 60);
  };
  find.onkeydown = (e) => {
    if (e.key !== "Enter") return;
    const q = find.value.trim().toLowerCase();
    const d = decls.find((d) => d.id.toLowerCase() === q) || decls.find((d) => d.id.toLowerCase().includes(q));
    if (d) location.hash = "#/node/" + encodeURIComponent(d.id);
  };
}

// ------------------------------------------------------------------ node page
function depLinks(list) {
  if (!list.length) return `<span class="muted small">none in this project</span>`;
  return list.map((id) => `<a class="st-${status(id)}" href="#/node/${encodeURIComponent(id)}" title="${STATUS_LABEL[status(id)]}">${esc(id)}</a>`).join("");
}
function agentPrompt(d) {
  return `You are writing an informal explainer for one declaration of the Turyn Lean library
(https://github.com/${REPO}, directory lean/, MIT): Turyn-type sequences and the Goethals–Seidel
construction of Hadamard matrices. The Lean is the ground truth.

Target: ${d.name}  (${d.kind})
Source: ${BLOB}/${d.file}#L${d.line}-L${d.endLine}
Section variables in scope: ${d.variables.join(" ") || "(none)"}
Formal statement:
${d.statement}

It mentions these project declarations (explain them by name, link to them): ${d.meaningDeps.join(", ") || "none"}
Its proof uses: ${d.proofDeps.join(", ") || "n/a"}

Write site/nodes/${d.id}.md following CONTRIBUTING.md and site/schema/node.schema.json:
YAML frontmatter (id, title, summary, review: draft, authors, caveats, quiz of 3-6 questions with answers and
explanations, optional widgets) and a Markdown body with a '## Plain English' section.
Be faithful to the Lean statement as written: hypotheses, quantifier order, ∃ vs ∀, natural-number subtraction
(n - 1 and 3 * n - 1 stop at 0), 0-indexed Fin positions vs the 1-indexed xAt/yAt/zAt/wAt, Prop vs Bool.
Do not import claims from the papers or the README that the Lean does not state. List anything you are unsure of
under caveats. Run 'cd site && npm ci && npm test' before opening a PR.`;
}
function nodePage(id) {
  const d = byId.get(id);
  if (!d) { app.innerHTML = `<p>No declaration <code>${esc(id)}</code>. <a href="#/nodes">All nodes</a></p>`; return; }
  const n = nodes[id];
  const r = rec(id);
  if (!r.viewed) { r.viewed = Date.now(); save(); }
  const st = status(id);
  const links = linkMap([...d.meaningDeps, ...d.proofDeps, id]);
  const src = `${BLOB}/${d.file}#L${d.line}-L${d.endLine}`;
  const editUrl = n ? `https://github.com/${REPO}/edit/main/site/nodes/${encodeURIComponent(id)}.md`
    : `https://github.com/${REPO}/new/main/site/nodes?filename=${encodeURIComponent(id)}.md`;
  const pendingDeps = d.meaningDeps.filter((x) => !understood(x));
  app.innerHTML = `
    <div class="node-head">
      <p class="small"><a href="#/">← graph</a></p>
      <h1>${n ? esc(n.title) : esc(id)}</h1>
      <div><span class="pill kind-${d.kind}">${d.kind}</span><span class="pill st-${st}">${STATUS_LABEL[st]}</span>${n ? `<span class="pill ${n.review === "draft" ? "draft" : ""}">${n.review}</span>` : ""}
      <span class="name">${esc(d.name)}</span></div>
      ${n ? `<p class="eli5" style="margin:.6rem 0">${n.summaryHtml}</p>` : ""}
    </div>
    <h2>Formal statement</h2>
    <pre class="lean">${highlight(d.statement, links)}${d.truncated ? `<span class="cm"> := … (proof omitted)</span>` : ""}</pre>
    ${d.extracted === false ? `<p class="small note-added">Added from the source, outside the extracted build: this declaration lives in a module that was not compiled when the declaration graph was built, so its dependencies were read from the source file rather than from the compiled proof.${d.generated ? " Its module is <b>generated</b> by <code>scripts/gen_certificates.sh</code> and is not committed upstream." : ""} <a href="#/trust">What was checked where →</a></p>` : ""}
    <p class="small muted"><a href="${src}" target="_blank" rel="noopener">${esc(d.file)} lines ${d.line}–${d.endLine}</a>
    ${d.variables.length ? ` · section variables in scope: <code>${esc(d.variables.join("  "))}</code>` : ""}</p>
    <div class="small">
      <div><b>Mentions</b> (understand these first): <div class="deps">${depLinks(d.meaningDeps)}</div></div>
      ${d.kind === "theorem" ? `<div><b>Proof uses</b>: <div class="deps">${depLinks(d.proofDeps)}</div></div>` : ""}
      <div><b>Used by</b>: <div class="deps">${depLinks(d.usedBy.slice(0, 40))}${d.usedBy.length > 40 ? `<span>+${d.usedBy.length - 40} more</span>` : ""}</div></div>
      ${d.mathlib.length ? `<div><b>From Mathlib</b> (taken as given): <div class="deps">${d.mathlib.map((m) => `<a href="${MATHLIB_DOCS(m)}" target="_blank" rel="noopener">${esc(m)}</a>`).join("")}</div></div>` : ""}
    </div>
    <div id="content"></div>`;
  const c = document.getElementById("content");
  if (!n) {
    c.innerHTML = `
      <div class="panel stub"><h3>Needs explainer</h3>
      <p>Nobody has written a plain-English explanation and quiz for this declaration yet, so it can't be signed off.
      <a href="${editUrl}" target="_blank" rel="noopener">Write one on GitHub</a> (see <a href="https://github.com/${REPO}/blob/main/site/CONTRIBUTING.md">CONTRIBUTING.md</a>).</p>
      <details><summary>Prompt for an AI agent</summary><textarea class="prompt" readonly>${esc(agentPrompt(d))}</textarea></details></div>`;
  } else {
    c.innerHTML = `
      <div class="eli5">${n.bodyHtml}</div>
      <div id="widgets"></div>
      ${n.caveatsHtml.length ? `<div class="panel caveats"><h3>Faithfulness notes</h3><ul>${n.caveatsHtml.map((x) => `<li>${x}</li>`).join("")}</ul></div>` : ""}
      <h2>Check your understanding</h2>
      <div class="panel quiz" id="quiz"></div>
      <div class="panel signoff" id="signoff"></div>
      <p class="small muted">Spotted an error or have a better explanation? <a href="${editUrl}" target="_blank" rel="noopener">Edit this node on GitHub</a>
      · <details style="display:inline"><summary>agent prompt</summary><textarea class="prompt" readonly>${esc(agentPrompt(d))}</textarea></details></p>`;
    const w = document.getElementById("widgets");
    for (const spec of n.widgets || []) mountWidget(w, spec);
    renderQuiz(id, n);
  }
  c.insertAdjacentHTML("beforeend", `<h2>Discussion</h2><div class="giscus-wrap" id="giscus"></div>`);
  mountGiscus(id);
  // pendingDeps is shown in the sign-off panel
  nodePage.pending = pendingDeps;
}

function renderQuiz(id, n) {
  const qz = document.getElementById("quiz");
  const r = rec(id);
  const answers = r.answers || {};
  qz.innerHTML = n.quiz.map((q, i) => {
    let input;
    if (q.type === "choice") input = q.choicesHtml.map((c, j) => `<label class="choice"><input type="radio" name="q${i}" value="${j}" ${answers[i] === j ? "checked" : ""}> ${c}</label>`).join("");
    else input = `<input type="text" name="q${i}" value="${answers[i] != null ? esc(answers[i]) : ""}" placeholder="${q.type === "number" ? "a number" : "your answer"}">`;
    return `<div class="q" data-i="${i}"><div><b>Q${i + 1}.</b> ${q.qHtml}</div>${input}<div class="verdict"></div><div class="explain">${q.explainHtml}</div></div>`;
  }).join("") + `<button class="primary" id="check">Check answers</button> <span id="qres"></span>`;
  const check = () => {
    let right = 0;
    const ans = {};
    n.quiz.forEach((q, i) => {
      const box = qz.querySelector(`.q[data-i="${i}"]`);
      let ok = false, given;
      if (q.type === "choice") { const s = box.querySelector("input:checked"); given = s ? +s.value : null; ok = isCorrect(q, given); }
      else {
        given = box.querySelector("input").value;
        ok = isCorrect(q, given);
      }
      ans[i] = given;
      if (given === null || given === "") { box.classList.remove("answered"); box.querySelector(".verdict").innerHTML = ""; return; }
      box.classList.add("answered");
      box.querySelector(".verdict").innerHTML = ok ? `<span class="ok">✓ correct</span>` : `<span class="bad">✗ not quite — read the explanation and try again</span>`;
      if (ok) right++;
    });
    r.answers = ans;
    const passed = right === n.quiz.length;
    if (passed && !r.quizPassed) r.quizPassed = Date.now();
    save();
    document.getElementById("qres").innerHTML = passed ? `<b class="ok" style="color:var(--green)">All ${right} correct. Quiz passed.</b>` : `${right} / ${n.quiz.length} correct`;
    renderSignoff(id);
  };
  document.getElementById("check").onclick = check;
  if (r.answers) check(); else renderSignoff(id);
}
function renderSignoff(id) {
  refresh();
  const box = document.getElementById("signoff");
  const r = rec(id), d = byId.get(id);
  const pending = d.meaningDeps.filter((x) => !understood(x));
  const can = !!r.quizPassed;
  box.classList.toggle("locked", !can);
  box.innerHTML = `
    <label><input type="checkbox" id="so" ${r.signedOff ? "checked" : ""} ${can ? "" : "disabled"}>
    <b>I understand the formal statement</b> — I could explain what the Lean above says, including its hypotheses, to someone else.</label>
    <p class="small muted">${can ? "" : "Pass the quiz above to unlock the sign-off. "}
    ${understood(id) ? `<span class="status-line" style="color:var(--green)">✓ Understood: you've signed off on this and on everything it mentions.</span>`
      : r.signedOff && can ? `Signed off. It becomes <b>understood</b> once these are understood too: ${pending.map((x) => `<a href="#/node/${encodeURIComponent(x)}">${esc(x)}</a>`).join(", ")}.`
      : pending.length ? `Mentions still to understand: ${pending.map((x) => `<a href="#/node/${encodeURIComponent(x)}">${esc(x)}</a>`).join(", ")}.` : ""}</p>`;
  const so = document.getElementById("so");
  if (so) so.onchange = () => { if (so.checked) r.signedOff = Date.now(); else delete r.signedOff; save(); renderSignoff(id); updateHeaderPill(id); };
  updateHeaderPill(id);
}
function updateHeaderPill(id) {
  refresh();
  const p = document.querySelector(".node-head .pill[class*='st-']");
  if (p) { const st = status(id); p.className = `pill st-${st}`; p.textContent = STATUS_LABEL[st]; }
}

function mountGiscus(id) {
  const el = document.getElementById("giscus");
  if (location.protocol === "file:") { el.innerHTML = `<p class="muted small">Comments load on the published site.</p>`; return; }
  const s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  Object.entries({
    "data-repo": GISCUS.repo, "data-repo-id": GISCUS.repoId, "data-category": GISCUS.category, "data-category-id": GISCUS.categoryId,
    "data-mapping": "specific", "data-term": `node: ${id}`, "data-strict": "1", "data-reactions-enabled": "1",
    "data-emit-metadata": "0", "data-input-position": "top", "data-theme": "dark", "data-lang": "en", "data-loading": "lazy",
  }).forEach(([k, v]) => s.setAttribute(k, v));
  s.crossOrigin = "anonymous"; s.async = true;
  el.append(s);
}

// ------------------------------------------------------------------ list page
function listPage(fileFilter) {
  const q = new URLSearchParams(location.hash.split("?")[1] || "");
  const file = fileFilter || q.get("file");
  const rows = decls.filter((d) => !file || d.module === file)
    .sort((a, b) => (!!nodes[b.id] - !!nodes[a.id]) || ((a.depth ?? 99) - (b.depth ?? 99)) || a.id.localeCompare(b.id));
  app.innerHTML = `<h1>${file ? `Declarations in ${esc(file)}.lean` : "All declarations"}</h1>
    <p class="muted">${Object.keys(nodes).length} with explainers, ${decls.length - Object.keys(nodes).length} awaiting one. ${file ? `<a href="#/nodes">show all</a>` : ""}
    Agents: the work list is <a href="data/needs-explainer.json">data/needs-explainer.json</a>.</p>
    <input type="text" id="flt" placeholder="filter…" style="max-width:20rem">
    <div class="table-wrap"><table class="node-list"><thead><tr><th>declaration</th><th>kind</th><th>status</th><th>distance from the theorem</th><th>file</th></tr></thead>
    <tbody>${rows.map((d) => `<tr data-id="${esc(d.id.toLowerCase())}"><td><a href="#/node/${encodeURIComponent(d.id)}">${esc(d.id)}</a></td><td><span class="pill kind-${d.kind}">${d.kind}</span></td><td><span class="pill st-${status(d.id)}">${STATUS_LABEL[status(d.id)]}</span></td><td>${d.depth ?? "—"}</td><td class="small muted">${d.module}</td></tr>`).join("")}</tbody></table></div>`;
  document.getElementById("flt").oninput = (e) => {
    const v = e.target.value.toLowerCase();
    app.querySelectorAll("tbody tr").forEach((tr) => (tr.style.display = tr.dataset.id.includes(v) ? "" : "none"));
  };
}

// ------------------------------------------------------------------ playground
function playgroundPage() {
  app.innerHTML = `<h1>Playground</h1>
    <p class="muted">Things to push on: four ±1 sequences whose autocorrelations cancel, the arithmetic identity that
    follows, and the construction that turns them into a Hadamard matrix. Everything here is an <b>illustration</b> —
    JavaScript recomputing one case at a time. The Lean proves the general statements for every <i>n</i>; for the two
    concrete quadruples it ran a compiled check (see <a href="#/trust">Trust</a>).</p>
    <h2>Build a Turyn-type quadruple</h2>
    <p class="muted">Click cells to flip signs. A quadruple (X, Y, Z, W) of lengths (n, n, n, n − 1) is
    <a href="#/node/IsTurynType">Turyn-type</a> when, at every shift 1 ≤ s &lt; n, the
    <a href="#/node/aperiodicAutocorr">aperiodic autocorrelations</a> cancel: N<sub>X</sub>(s) + N<sub>Y</sub>(s) +
    2N<sub>Z</sub>(s) + 2N<sub>W</sub>(s) = 0. Try the presets, including Kharaghani and Tayfeh-Rezaie's TT(36).</p>
    <div id="pg1"></div>
    <h2>One sequence against itself</h2>
    <div id="pg2"></div>
    <h2>The energy identity</h2>
    <p class="muted"><a href="#/node/energy_identity">energy_identity</a>: for any TT(n) with n ≥ 1, the sums satisfy
    x² + y² + 2z² + 2w² = 6n − 2.</p>
    <div id="pg3"></div>
    <h2>From TT(n) to a Hadamard matrix</h2>
    <p class="muted"><a href="#/node/turynToHadamardMatrix">turynToHadamardMatrix</a> is
    <a href="#/node/step2">step2</a> (a T-sequence of length 3n − 1) followed by the
    <a href="#/node/gsMatrix">Goethals–Seidel array</a>. Step through it, then look at the result.</p>
    <div id="pg4"></div>
    <div id="pg5"></div>
    <h2>Moves and the XY law</h2>
    <div id="pg6"></div>
    <div id="pg7"></div>`;
  mountWidget(document.getElementById("pg1"), { type: "seq-editor", title: "Turyn-type quadruple editor", config: { preset: "tt6", show: ["bars", "table", "energy"] } });
  mountWidget(document.getElementById("pg2"), { type: "autocorr", title: "Aperiodic autocorrelation N(s)", config: { seq: "--+-++", s: 1 } });
  mountWidget(document.getElementById("pg3"), { type: "energy", title: "Energy calculator", config: { preset: "kh05" } });
  mountWidget(document.getElementById("pg4"), { type: "pipeline", title: "The pipeline, step by step", config: { preset: "n2" } });
  mountWidget(document.getElementById("pg5"), { type: "hadamard", title: "Hadamard matrix viewer", config: { source: "kh05" } });
  mountWidget(document.getElementById("pg6"), { type: "moves", title: "Elementary moves", config: { preset: "tt6" } });
  mountWidget(document.getElementById("pg7"), { type: "xy-law", title: "The XY product law", config: { preset: "tt6" } });
}

// ------------------------------------------------------------------ about
function aboutPage() {
  app.innerHTML = `<h1>About this site</h1>
  <div class="eli5">
  <p>Formalization usually goes from English to Lean: the job is done when Lean accepts the proof. This site goes the
  other way — <b>informalization</b>. The Lean here is finished and builds. The job is done when a <b>reader</b>
  accepts it: when you can say what each formal statement means and back that up by passing a quiz.</p>

  <h2>What is being read</h2>
  <p>The Lean library in this repository's <a href="https://github.com/${REPO}/tree/main/lean" target="_blank" rel="noopener"><code>lean/</code></a>
  directory (about 4,100 lines, Lean v4.28.0 with Mathlib v4.28.0). The rest of the repository is a Rust search for
  Turyn-type sequences TT(n), aiming at TT(56) and through it a Hadamard matrix of order 4(3·56 − 1) = 668, the
  smallest order for which none is known. The Lean is what a found TT(n) would be checked with.</p>
  <p>The headline results:</p>
  <ul>
  <li><a href="#/node/Result.tt_implies_hadamard"><code>Turyn.Result.tt_implies_hadamard</code></a> — if four ±1
  sequences X, Y, Z, W of lengths n, n, n, n − 1 satisfy <a href="#/node/IsTurynType">IsTurynType</a>, then some
  integer matrix of order 4(3n − 1) is a <a href="#/node/IsHadamardMat">Hadamard matrix</a>. The witness is built
  explicitly.</li>
  <li><a href="#/node/kharaghani_2005_tt36"><code>kharaghani_2005_tt36</code></a> and
  <a href="#/node/tt6_valid"><code>tt6_valid</code></a> — two concrete quadruples are Turyn-type, checked by
  <code>native_decide</code>; and <a href="#/node/hadamard_428_exists"><code>hadamard_428_exists</code></a>, which
  packages the first with 4(3·36 − 1) = 428.</li>
  <li><a href="#/node/energy_identity"><code>energy_identity</code></a> — the sums of a TT(n) satisfy
  x² + y² + 2z² + 2w² = 6n − 2.</li>
  <li><a href="#/node/canonical_representative_exists"><code>canonical_representative_exists</code></a> — for even
  n ≥ 2, every TT(n) can be moved to one in canonical form by the elementary moves.</li>
  <li><a href="#/node/Result.xy_interior_antipalindrome"><code>Turyn.Result.xy_interior_antipalindrome</code></a> —
  the “XY product law”: with endpoint signs normalized and n ≥ 4, u<sub>n+1−k</sub> = −u<sub>k</sub> for
  2 ≤ k ≤ n − 1, where u = X·Y entrywise.</li>
  </ul>

  <h2>How “understood” works</h2>
  <ul>
  <li>Each node is one Lean declaration. ${decls.length} of them are listed here, ${reachable.length} reachable from
  the headline results, extracted from the compiled library.</li>
  <li>A node with an explainer has the verbatim Lean, a plain-English reading, often an interactive illustration,
  and a quiz with an answer key.</li>
  <li>You can sign off on a node only after passing its quiz. It counts as <b>understood</b> once you've signed off on
  it <i>and</i> every project declaration its statement mentions is understood. For a definition the body counts as
  part of the statement, because the body is what it means. For a theorem only the statement counts.</li>
  <li>Mathlib's definitions are taken as given and linked to their documentation.</li>
  </ul>
  <p>Every demonstration widget on this site is an <b>illustration</b>: JavaScript that mirrors a Lean definition
  (<code>site/assets/turyn.js</code>, tested against the Lean's own examples) and recomputes one case. None of them is
  evidence for a theorem, and each says so. (The <code>outline</code> and <code>walkthrough</code> widgets are summaries
  of the proof's own steps.)</p>

  <h2>Contributing (humans and AI agents)</h2>
  <p>Every explainer is one Markdown file, <code>site/nodes/&lt;id&gt;.md</code>, with YAML frontmatter that holds the
  quiz key. See <a href="https://github.com/${REPO}/blob/main/site/CONTRIBUTING.md">CONTRIBUTING.md</a>. CI validates each
  file against a JSON schema and against the extracted Lean declarations. Each stub page has a ready-made agent
  prompt, and <a href="data/needs-explainer.json">data/needs-explainer.json</a> lists the open work, nearest the
  headline results first.</p>

  <h2>Credits</h2>
  <ul>
  <li><b>The Lean library</b>: Michal Wallace (<a href="https://github.com/tangentstorm" target="_blank" rel="noopener">tangentstorm</a>),
  MIT, with proofs and refactors contributed by AI tools as recorded in the git history (Claude, OpenAI Codex — the XY
  product law is credited to Codex in the source — and Harmonic's Aristotle, co-author of the commits that migrated
  <code>Equivalence.lean</code>, <code>XY.lean</code> and <code>TSequence.lean</code> to the function-typed carriers
  and that cleaned up <code>GoethalsSeidel.lean</code>).</li>
  <li><b>The mathematics</b>: R. J. Turyn (Turyn-type sequences); J.-M. Goethals and J. J. Seidel (1967, the array);
  H. Kharaghani and B. Tayfeh-Rezaie (2005, the TT(36) and the order-428 Hadamard matrix); D. Best, D. Ž. Đoković,
  H. Kharaghani and H. Ramp (2013, arXiv:1206.4107, the classification and the six-step normalization).</li>
  <li><b><a href="https://github.com/leanprover-community/mathlib4" target="_blank" rel="noopener">Mathlib</a></b>, Apache-2.0.</li>
  <li><b>This site.</b> The explanations, quizzes and widgets were written by AI agents for Michal Wallace. They are
  not part of the proof and may be wrong. When this site and the Lean disagree, the Lean is right.</li>
  </ul>
  </div>`;
}

// ------------------------------------------------------------------ trust
const AX3 = "<code>[propext, Classical.choice, Quot.sound]</code>";
const AXN = "<code>[propext, Classical.choice, Lean.ofReduceBool, Lean.trustCompiler, Quot.sound]</code>";
function trustPage() {
  const tc = (xs) => xs.map((x) => `<a href="#/node/${encodeURIComponent(x)}"><code>${esc(x)}</code></a>`).join(", ");
  app.innerHTML = `<h1>Trust: what was checked, and how</h1>
  <div class="eli5">
  <p>A formal proof is worth what its statement says and what actually checked it. Here is the accounting, with the
  one place where the library's own README overstates things.</p>

  <h2>The build</h2>
  <p><code>lake build</code> of <code>lean/</code> (Lean v4.28.0, Mathlib v4.28.0, Mathlib's cache) succeeds on this
  site's build machine, as do <code>lake build Results Challenge</code>. No Lean file was changed for this site.
  <code>Challenge.lean</code> contains two <code>sorry</code>s: it is the <i>challenge module</i> for
  <a href="https://github.com/leanprover/comparator" target="_blank" rel="noopener">comparator</a> — the two headline
  statements with their proofs blanked out — and <code>Results.lean</code> proves the same two statements. That is the
  comparator layout, not a gap. (Comparator itself was not run here.)</p>

  <h2>Axioms: two kinds of theorem</h2>
  <p><b>General theorems — the kernel checked everything.</b> <code>#print axioms</code> gives ${AX3}, Lean's three
  standard axioms, for: ${tc(["Result.tt_implies_hadamard", "Result.xy_interior_antipalindrome", "ofIsTurynTypeMatrix_isHadamard", "turynToHadamardMatrix_isHadamard", "typedGsMatrix_isHadamard", "step2_periodic", "energy_identity", "turyn_vanishing_total", "weightedTotalAutocorr_decompose", "sum_sq_eq_len_add_two_totalAutocorr", "canonical_representative_exists", "xy_product_law", "xy_product_eq_neg_one"])}.
  These are statements about <i>every</i> n and every quadruple, so no computation is involved.</p>
  <p><b>Concrete examples — the compiler was trusted.</b> Every theorem about the two specific quadruples is proved
  with <code>native_decide</code>, and <code>#print axioms</code> gives ${AXN} for ${tc(["hadamard_428_exists", "kharaghani_2005_tt36", "tt6_valid", "tt6_hadamard_isHadamard"])}, <code>tt6_energy</code>,
  <code>tt6_sums</code>, <code>kh05_energy</code> and <code>kh05_sums</code>, and just
  <code>[Lean.ofReduceBool, Lean.trustCompiler]</code> for <code>kh05_hadamard_order</code> (that 4(3·36 − 1) = 428).</p>
  <p><code>native_decide</code> compiles the Boolean check to native code, runs it, and asks the kernel to accept the
  answer via the axiom <code>Lean.ofReduceBool</code>. The kernel does <b>not</b> re-check the computation; you are
  trusting Lean's compiler, its runtime and any <code>implemented_by</code>/<code>extern</code> code the check reaches.
  For a check this small (35 sums of products of ±1s) that risk is small, but it is a different kind of guarantee.</p>
  <p class="panel caveats"><b>Correction to <code>lean/README.md</code>.</b> The README says the library is
  “axiom-free beyond Lean's three standard axioms” and that <code>native_decide</code> “certifies the result” so that
  everything is “fully verified by Lean's kernel”. That holds for the general theorems above, but <b>not</b> for the
  concrete TT(6) and TT(36) theorems, which depend on <code>Lean.ofReduceBool</code> and
  <code>Lean.trustCompiler</code>. Comparator's <code>permitted_axioms</code> list is the standard three, which is
  consistent: comparator is only asked about the two general theorems.</p>
  <p><b>The kernel can do it instead.</b> As a test outside the repository, <code>decide +kernel</code> proves
  <code>IsTurynType tt6X tt6Y tt6Z tt6W</code> in seconds with only ${AX3}. ${K36_NOTE}</p>

  <h2>What the headline theorems do and do not say</h2>
  <ul>
  <li><a href="#/node/hadamard_428_exists"><code>hadamard_428_exists</code></a> says <i>there is a TT(36), and
  4(3·36 − 1) = 428</i>. It does not itself say a Hadamard matrix of order 428 exists. That follows by applying
  <a href="#/node/Result.tt_implies_hadamard"><code>tt_implies_hadamard</code></a> to
  <code>kharaghani_2005_tt36</code>, a one-line step no theorem in the library takes. (The site's
  <code>hadamard</code> widget builds that matrix in your browser and checks H·Hᵀ = 428·I — an illustration.)</li>
  <li>The XY law assumes only <a href="#/node/Canonical1"><code>Canonical1</code></a>, the endpoint-sign
  normalization, not the full six-part <a href="#/node/Canonical"><code>Canonical</code></a>.</li>
  <li><a href="#/node/canonical_representative_exists"><code>canonical_representative_exists</code></a> is for even
  n ≥ 2, and proves existence only; uniqueness of the canonical form is not formalized.</li>
  <li>The README describes a base-sequence → T-sequence → Goethals–Seidel pipeline. The Lean's construction goes
  straight from the TT(n) to a T-sequence (<a href="#/node/step2"><code>step2</code></a>); the base sequences of
  <a href="#/node/step1"><code>step1</code></a> are proved correct but no headline theorem uses them.</li>
  <li>Nothing here proves that a TT(n) exists for any n other than 6 and 36 (with n = 1, 2 and 4 found only by this
  site's JavaScript), and nothing is claimed about TT(56) or order 668.</li>
  </ul>

  <h2>The declaration graph</h2>
  <p>Extracted from the compiled library by <code>site/tools/ExtractDecls.lean</code> (every declaration in the
  <code>Turyn.*</code> modules and <code>Results</code>, with the constants its statement and its proof use) and
  post-processed by <code>site/tools/build_decls.py</code>. <code>Challenge.lean</code> is not in the graph, since it
  restates the same two names with <code>sorry</code>. The axiom list above comes from
  <code>site/tools/Axioms.lean</code>.</p>

  <h2>And this site</h2>
  <p>The explanations, quizzes and widgets here were written by AI agents for Michal Wallace (tangentstorm), and
  audited against the Lean by a second agent. They are not part of the proof and carry no weight as evidence. Nodes
  marked <code>draft</code> have not been checked by a human. If an explanation and the Lean disagree, the Lean is
  right — <a href="https://github.com/${REPO}/issues">please report it</a>.</p>
  </div>`;
}
const K36_NOTE = "The same goes for Kharaghani and Tayfeh-Rezaie's TT(36): <code>decide +kernel</code> proves <code>IsTurynType kh05X kh05Y kh05Z kh05W</code> with only " + AX3 + " (about 8 s of CPU on top of loading Mathlib), and <code>hadamardOrder 36 = 428</code> needs no axioms at all by plain <code>decide</code>. So every <code>native_decide</code> in the library could be replaced by a kernel check; the committed library has not done that.";

route();
