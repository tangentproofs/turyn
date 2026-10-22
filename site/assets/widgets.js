// Interactive demos. Each widget is mount(el, config) and is self-contained.
// The drawing-heavy ones live in widgets-interactive.js; the arithmetic they all share lives
// in turyn.js, where every function mirrors a named Lean definition in lean/Turyn/*.lean and
// is covered by tools/test_widgets.mjs.
import { h, esc, field, btn, yes, illustration, stepper } from "./dom.js";
import * as T from "./turyn.js";
import { INTERACTIVE, PRESETS, PRESET_KEYS, presetSelect, resolvePreset, quadRows, pmRow,
  bigTable, verdictLine, lagChart, matrixCanvas, pmLegend, swatch, SEQ_COLOR, cloneQ, appendAll } from "./widgets-interactive.js";

// A step's `link` may be a declaration id or an already-written route.
const nodeHref = (link) => (String(link).startsWith("#") ? String(link) : `#/node/${encodeURIComponent(link)}`);
// Declaration ids drop the `Turyn.` prefix, as on the node pages. `ref` links; `decl` only
// names — a declaration without a node page of its own should not become a dead link.
const ref = (id) => `<a href="${nodeHref(id)}"><code>${esc(id)}</code></a>`;
const refs = (...ids) => ids.map(ref).join(", ");
const decl = (id) => `<code>${esc(id)}</code>`;
const fmt = (v) => (v > 0 ? `+${v}` : String(v));

// ---------------------------------------------------------------- outline
function outlineWidget(el, cfg = {}) {
  el.append(h("div", { class: "flow", html: (cfg.steps || []).map((s, i) =>
    `${i ? '<div class="arrow">↓</div>' : ""}<div class="step${s.hard ? " hard" : ""}">${s.link ? `<a href="${nodeHref(s.link)}">${esc(s.text)}</a>` : esc(s.text)}${s.note ? `<div class="small muted">${esc(s.note)}</div>` : ""}</div>`).join("") }));
}

// ---------------------------------------------------------------- walkthrough
// A proof outline you step through, one line at a time, with the nodes each step uses.
function walkthroughWidget(el, cfg = {}) {
  const steps = cfg.steps || [];
  const listBox = h("div", { class: "flow wt" }), detail = h("div", { class: "wtdetail" });
  const bar = h("div");
  let i = 0, all = false;
  el.append(bar, listBox, detail);
  function run() {
    bar.innerHTML = "";
    bar.append(h("div", { class: "row steps" },
      btn("⏮", () => { i = 0; run(); }),
      btn("◀ back", () => { i = Math.max(0, i - 1); run(); }, { disabled: i === 0 ? "" : null }),
      btn("next ▶", () => { i = Math.min(steps.length - 1, i + 1); run(); }, { class: "primary", disabled: i >= steps.length - 1 ? "" : null }),
      h("span", { class: "small muted" }, ` step ${i + 1} / ${steps.length}`),
      btn(all ? "step through" : "show all", () => { all = !all; run(); })));
    listBox.innerHTML = steps.map((s, j) => {
      const on = all || j === i;
      return `${j ? '<div class="arrow">↓</div>' : ""}<div class="step${s.hard ? " hard" : ""}${j === i ? " on" : ""}${on ? "" : " off"}" data-j="${j}">${s.link ? `<a href="${nodeHref(s.link)}">${esc(s.text)}</a>` : esc(s.text)}</div>`;
    }).join("");
    listBox.querySelectorAll(".step").forEach((d) => d.addEventListener("click", (ev) => { if (ev.target.tagName !== "A") { i = +d.dataset.j; run(); } }));
    const s = steps[i] || {};
    const uses = [...(s.uses || []), ...(s.link ? [s.link] : [])].filter((v, k, a) => a.indexOf(v) === k);
    detail.innerHTML = `
      ${s.note ? `<p>${esc(s.note)}</p>` : ""}
      ${s.lean ? `<pre class="lean"><span class="var">${esc(s.lean)}</span></pre>` : ""}
      ${uses.length ? `<div class="small"><b>Nodes used here:</b> <span class="deps">${uses.map((u) => `<a href="${nodeHref(u)}">${esc(String(u).replace(/^#\/node\//, ""))}</a>`).join("")}</span></div>` : ""}`;
  }
  run();
}

// A preset picker plus a "reset to the example" button, shared by the table-shaped widgets.
function presetHeader(el, key0, onpick, { keys = PRESET_KEYS } = {}) {
  let key = PRESETS[key0] ? key0 : resolvePreset(key0).key;
  const pick = presetSelect(key, (k) => { key = k; onpick(resolvePreset(k).q, k); });
  el.append(h("div", { class: "row" }, field("example", pick),
    btn("reset", () => onpick(resolvePreset(key).q, key), { title: "back to the example as published" })));
  return () => key;
}

// ============================================================================ energy
// Energy.lean in one screen: the per-sequence identity (Σa)² = len + 2·totalAutocorr holds for
// *any* ±1 sequence, and the four of them add up to 6n − 2 exactly when the TT lags vanish.
function energyWidget(el, cfg = {}) {
  let q = resolvePreset(cfg.preset ?? "tt6").q;
  const cells = h("div"), out = h("div");
  presetHeader(el, cfg.preset ?? "tt6", (nq) => { q = nq; render(); });
  el.append(h("p", { class: "small muted" }, "Click any cell to flip it and watch which identity survives."),
    cells, out,
    illustration("Illustration — not the Lean proof. `sum_sq_eq_len_add_two_totalAutocorr` and `energy_identity` are proved for every sequence and every TT(n); this widget evaluates both sides for the quadruple on screen."));

  function render() {
    const n = q.X.length;
    cells.innerHTML = "";
    cells.append(quadRows(q, { onflip: (k, i) => { q[k] = q[k].slice(); q[k][i] = -q[k][i]; render(); } }));
    const per = [["X", q.X], ["Y", q.Y], ["Z", q.Z], ["W", q.W]].map(([k, a]) => {
      const s = T.seqSum(a), tot = T.totalAutocorr(a);
      return { k, len: a.length, s, sq: s * s, tot, rhs: a.length + 2 * tot, ok: s * s === a.length + 2 * tot };
    });
    const lhs = T.energyLHS(q), rhs = T.energyRHS(n), wt = T.weightedTotalAutocorr(q), isTT = T.isTurynType(q);
    out.innerHTML = "";
    appendAll(out,
      h("h4", {}, "one sequence at a time: (Σa)² = len + 2 · totalAutocorr a"),
      bigTable(["a", "len", "Σa", "(Σa)²", "totalAutocorr", "len + 2·total", "equal?"],
        per.map((r) => ({ bad: !r.ok, cells: [r.k, r.len, fmt(r.s), r.sq, fmt(r.tot), r.rhs, r.ok ? "✓" : "✗"] }))),
      h("p", { class: "small muted", html: `${decl("sum_sq_eq_len_add_two_totalAutocorr")} needs nothing but ±1 entries, so no flip can break those four rows.` }),
      h("h4", {}, "all four together: x² + y² + 2z² + 2w² = 6n − 2"),
      h("table", { class: "t left kv" },
        h("tr", {}, h("th", {}, "x, y, z, w"), h("td", { html: per.map((r) => `${r.k.toLowerCase()} = ${fmt(r.s)}`).join(", ") })),
        h("tr", {}, h("th", { html: "energyLHS" }), h("td", { html: `${fmt(per[0].s)}² + ${fmt(per[1].s)}² + 2·${fmt(per[2].s)}² + 2·${fmt(per[3].s)}² = <b>${lhs}</b>` })),
        h("tr", {}, h("th", { html: "energyRHS" }), h("td", { html: `6·${n} − 2 = <b>${rhs}</b>` })),
        h("tr", { class: lhs === rhs ? null : "bad" }, h("th", {}, "difference"), h("td", { html: `${lhs} − ${rhs} = <b>${lhs - rhs}</b> = 2 · ${wt}` })),
        h("tr", {}, h("th", { html: "weightedTotalAutocorr" }), h("td", { html: `Σ<sub>s=1..${n - 1}</sub> C(s) = <b style="color:${wt === 0 ? "var(--green)" : "var(--pink)"}">${fmt(wt)}</b>` }))),
      verdictLine(lhs === rhs, `energy identity ${lhs === rhs ? "holds" : "fails"} here; <code>IsTurynType</code>: ${yes(isTT)}`),
      h("p", { class: "small muted", html:
        `Adding the four rows above gives <code>energyLHS = 6n − 2 + 2 · weightedTotalAutocorr</code> ` +
        `(${decl("weightedTotalAutocorr_decompose")}), so the total hits 6n − 2 exactly when Σ C(s) = 0. ` +
        `A TT makes <i>every</i> C(s) vanish (${decl("turyn_vanishing_total")}, ${decl("energy_identity")}, which needs n ≥ 1) — ` +
        `but the converse is weaker: a quadruple whose C(s) merely cancel in total also passes this line while failing <code>IsTurynType</code>.` }),
      wt === 0 && !isTT ? h("p", { class: "note-added small", html: "That is the case right now: the lags cancel in total but not one by one." }) : null);
  }
  render();
}

// ============================================================================ moves
// The ten `Elementary` moves. Each is proved to preserve the vanishing condition, so the
// verdict line never changes; what does change is whether the endpoint signs are canonical.
const MOVE_NOTE = {
  negX: "negate every entry of X", negY: "negate every entry of Y", negZ: "negate every entry of Z",
  negW: "negate every entry of W", revX: "reverse X", revY: "reverse Y", revZ: "reverse Z", revW: "reverse W",
  altAll: "multiply entry i of all four by (−1)ⁱ (`altSeqFn`)", swap: "swap X and Y",
};
function movesWidget(el, cfg = {}) {
  let start = resolvePreset(cfg.preset ?? "tt6").q, q = cloneQ(start), hist = [];
  const pad = h("div", { class: "row pad" }), cells = h("div"), out = h("div");
  presetHeader(el, cfg.preset ?? "tt6", (nq) => { start = nq; q = cloneQ(nq); hist = []; render(); });
  el.append(pad, cells, out,
    illustration("Illustration — not the Lean proof. Each move is one constructor of `Elementary`, and `vanishing_negX … vanishing_swapXY` prove that every one of them preserves the condition for all n; here you watch it happen to one quadruple."));

  function apply(m) { q = T.MOVES[m](q); hist = [...hist, m]; render(); }
  function render() {
    const n = q.X.length;
    pad.innerHTML = "";
    pad.append(
      ...Object.keys(T.MOVES).map((m) => btn(m, () => apply(m), { title: MOVE_NOTE[m] })),
      btn("undo", () => { const hs = hist.slice(0, -1); q = cloneQ(start); hist = []; for (const m of hs) { q = T.MOVES[m](q); hist.push(m); } render(); }, { disabled: hist.length ? null : "" }),
      btn("reset", () => { q = cloneQ(start); hist = []; render(); }, { disabled: hist.length ? null : "" }),
      btn("normalize endpoints", () => {
        const r = T.normalizeEndpoints(q);
        if (!r) { out.append(h("p", { class: "note-added small" }, "No sequence of ≤ 6 moves makes all six signs +1 from here.")); return; }
        for (const m of r.moves) { q = T.MOVES[m](q); hist.push(m); }
        render();
      }, { class: "primary", disabled: T.canonical1(q) || n < 2 ? "" : null }));
    // the six entries Canonical1 talks about, 1-indexed: x₁, xₙ, y₁, yₙ, z₁, w₁
    const ends = { X: [1, n], Y: [1, n], Z: [1], W: [1] };
    cells.innerHTML = "";
    cells.append(quadRows(q, {
      mark: (k, i, v) => (ends[k].includes(i + 1) ? `end ${v === 1 ? "endok" : "endbad"}` : ""),
    }));
    const c1 = T.canonical1(q), isTT = T.isTurynType(q);
    const six = [["x₁", T.at1(q.X, 1)], ["xₙ", T.at1(q.X, n)], ["y₁", T.at1(q.Y, 1)], ["yₙ", T.at1(q.Y, n)],
      ["z₁", T.at1(q.Z, 1)], ["w₁", T.at1(q.W, 1)]];
    out.innerHTML = "";
    appendAll(out,
      h("p", { class: "small", html: `history: ${hist.length ? hist.map((m) => `<span class="chip">${esc(m)}</span>`).join(" ") : '<span class="muted">none yet</span>'}` }),
      h("p", { html: `<b>IsTurynType</b>: ${yes(isTT)} <span class="small muted">— unchanged by every move, that is what ${decl("Elementary")} is for</span>` }),
      h("p", { html: `<b>Canonical1</b>: ${yes(c1)} &nbsp; ${six.map(([nm, v]) => `<span class="tag ${v === 1 ? "endok" : "endbad"}">${nm} = ${v === 1 ? "+1" : "−1"}</span>`).join(" ")}` }),
      h("p", { class: "small muted", html: `${decl("Canonical1")} asks for all six of those to be +1. The outlined cells above are the ones it reads — note the 1-indexed accessors ${decl("xAt")}/${decl("wAt")} use <code>lookupNat a (i - 1)</code>, which returns 0 out of range.` }),
      n < 2 ? h("p", { class: "note-added small", html: `At n = ${n} the sequence W is empty, so <code>wAt S 1</code> reads out of range and returns 0 — <code>Canonical1</code> cannot hold at all, whatever you press. That is one reason ${decl("canonical_representative_exists")} assumes n ≥ 2 (and n even).` }) : null,
      h("div", { class: "note-added small", html:
        `This widget only chases <code>Canonical1</code>. ${decl("canonical_representative_exists")} does much more: for <b>n even and n ≥ 2</b> it produces an equivalent quadruple satisfying all six conditions <code>Canonical1 … Canonical6</code> — the later ones compare X with its reverse, Y with its reverse, Z, W and then break the X/Y tie. Its ${decl("Equivalent")} relation is the reflexive–transitive closure of these same ten moves.` }));
  }
  render();
}

// ============================================================================ xy-law
// XY.lean's product law: for a canonical TT(n) with n ≥ 4, the products u_k = x_k·y_k are
// antisymmetric about the middle. Switch the normalization off and it falls apart.
function xyLawWidget(el, cfg = {}) {
  let q0 = resolvePreset(cfg.preset ?? "tt6").q, normalize = true;
  const cb = h("input", { type: "checkbox" });
  cb.checked = true;
  cb.addEventListener("change", () => { normalize = !!cb.checked; render(); });
  const out = h("div");
  presetHeader(el, cfg.preset ?? "tt6", (nq) => { q0 = nq; render(); });
  el.append(h("div", { class: "row" }, h("label", {}, cb, " normalize the endpoint signs first (Canonical1)")), out,
    illustration("Illustration — not the Lean proof. `xy_product_law` holds for every canonical TT(n) with n ≥ 4; this widget checks the n − 2 pairs of one quadruple."));

  function render() {
    const n = q0.X.length;
    let q = q0, moves = null, failed = false;
    if (normalize && !T.canonical1(q0)) {
      const r = T.normalizeEndpoints(q0);
      if (r) { q = r.q; moves = r.moves; } else failed = true;
    }
    const rows = T.xyLawRows(q), bad = rows.filter((r) => !r.ok);
    const c1 = T.canonical1(q), isTT = T.isTurynType(q);
    out.innerHTML = "";
    out.append(h("p", { class: "small muted", html:
      !T.canonical1(q0)
        ? (normalize
          ? (failed ? `No sequence of ≤ 6 moves reaches <code>Canonical1</code> from here${n < 2 ? " — at n = " + n + " the empty W makes it unreachable" : ""}, so the quadruple is shown as given.`
            : `This example is <b>not</b> <code>Canonical1</code> as published, so it was first moved by ${(moves || []).map((m) => `<code>${esc(m)}</code>`).join(" · ") || "no move"} — an ${decl("Equivalent")} quadruple, still a TT.`)
          : "Normalization is <b>off</b>: the hypothesis of the theorem is not met, so the law below is not guaranteed.")
        : "This example already satisfies <code>Canonical1</code>." }));
    out.append(h("div", { class: "scroll" },
      pmRow("X", q.X, { color: SEQ_COLOR.X }), pmRow("Y", q.Y, { color: SEQ_COLOR.Y }),
      pmRow("u", q.X.map((v, i) => v * q.Y[i]), { color: "var(--orange)", title: (i, v) => `u${i + 1} = x${i + 1}·y${i + 1} = ${v}` })));
    if (n < 4) out.append(h("p", { class: "note-added small", html: `n = ${n} < 4, so ${decl("xy_product_law")} says nothing here — its hypothesis is n ≥ 4 (plus <code>Canonical1</code>, and nothing else).` }));
    out.append(rows.length
      ? bigTable(["k", "u_k", "n+1−k", "u_{n+1−k}", "u_{n+1−k} = −u_k ?"],
        rows.map((r) => ({ bad: !r.ok, cells: [r.k, fmt(r.uk), r.j, fmt(r.uj), r.ok ? "✓" : "✗"] })))
      : h("p", { class: "small muted" }, "there is no k with 2 ≤ k ≤ n − 1 at this length"));
    out.append(
      verdictLine(bad.length === 0, rows.length
        ? `${rows.length - bad.length} of ${rows.length} pairs satisfy u_{n+1−k} = −u_k${bad.length ? ` — first failure at k = ${bad[0].k}` : ""}`
        : "nothing to check"),
      h("p", { class: "small", html: `<code>Canonical1</code>: ${yes(c1)} &nbsp; <code>IsTurynType</code>: ${yes(isTT)} &nbsp; n = ${n}` }),
      h("p", { class: "small muted", html:
        `${decl("xy_product_law")} assumes only n ≥ 4 and ${decl("Canonical1")} — no other canonical condition — and concludes <code>uAt S (n+1-k) = -(uAt S k)</code> for 2 ≤ k ≤ n−1. ` +
        `The corollary ${decl("xy_product_eq_neg_one")} rewrites that as x_k·y_k·x_{n+1−k}·y_{n+1−k} = −1. Indices here are 1-based, like ${decl("uAt")}.` }),
      h("p", { class: "small muted", html:
        `Honest caveat: <code>Canonical1</code> is what the Lean <i>proof</i> leans on (the endpoint signs feed its mod-4 argument), but switching the toggle off rarely breaks the conclusion — ` +
        `exhaustively enumerating every TT(n) for n = 4, 6 and 8 turns up no quadruple, canonical or not, that violates the law. So the toggle shows you whether the theorem <i>applies</i>, not a counterexample.` }));
  }
  render();
}

// ============================================================================ base-seq
// Step 1: base sequences. A and B share their first n entries and disagree on the rest, so the
// cross terms cancel and N_A + N_B is just 2N_Z + 2N_W.
function baseSeqWidget(el, cfg = {}) {
  let q = resolvePreset(cfg.preset ?? "tt6").q;
  const out = h("div");
  presetHeader(el, cfg.preset ?? "tt6", (nq) => { q = nq; render(); });
  el.append(out,
    illustration("Illustration — not the Lean proof. `step1` turns every TT(n) into base sequences and proves `BaseSeqData.vanishing` for all lags s ≥ 1; here you see the lag table of one quadruple."));

  function render() {
    const n = q.X.length, b = T.step1(q), len = Math.max(0, 2 * n - 1);
    const mark = (i) => (i < n ? "bz" : "bw");
    const rows = Array.from({ length: Math.max(0, 2 * n - 1) }, (_, k) => {
      const s = k + 1;
      const na = T.aperiodicAutocorr(b.A, s), nb = T.aperiodicAutocorr(b.B, s);
      const nc = T.aperiodicAutocorr(b.C, s), nd = T.aperiodicAutocorr(b.D, s);
      const zw = 2 * T.aperiodicAutocorr(q.Z, s) + 2 * T.aperiodicAutocorr(q.W, s);
      return { s, na, nb, nc, nd, sum: na + nb + nc + nd, zw, cross: na + nb === zw };
    });
    const bad = rows.filter((r) => r.sum !== 0), crossBad = rows.filter((r) => !r.cross);
    out.innerHTML = "";
    out.append(
      h("p", { html: `n = ${n}: A and B have length 2n − 1 = <b>${len}</b>, C and D length <b>${n}</b>. ` +
        `<span class="tag bz">Z</span> is the shared head; <span class="tag bw">W</span> is the tail, negated in B.` }),
      h("div", { class: "scroll" },
        pmRow("A", b.A, { color: SEQ_COLOR.A, mark, title: (i, v) => `A${i + 1} = ${v} (${i < n ? "Z" : "W"})` }),
        pmRow("B", b.B, { color: SEQ_COLOR.B, mark, title: (i, v) => `B${i + 1} = ${v} (${i < n ? "Z" : "−W"})` }),
        pmRow("C", b.C, { color: SEQ_COLOR.C, after: "= X" }),
        pmRow("D", b.D, { color: SEQ_COLOR.D, after: "= Y" })),
      h("p", { class: "small muted", html: `<code>step1</code>: A = Z ++ W, B = Z ++ (−W), C = X, D = Y, built with <code>appendFn</code> and <code>negSeqFn</code>.` }),
      bigTable(["s", "N_A", "N_B", "N_C", "N_D", "sum", "2N_Z + 2N_W", "N_A + N_B = that ?"],
        rows.map((r) => ({ bad: r.sum !== 0, cells: [r.s, fmt(r.na), fmt(r.nb), fmt(r.nc), fmt(r.nd),
          `<b style="color:${r.sum === 0 ? "var(--green)" : "var(--pink)"}">${fmt(r.sum)}</b>`, fmt(r.zw), r.cross ? "✓" : "✗"] }))),
      verdictLine(bad.length === 0, `N_A + N_B + N_C + N_D = 0 at ${rows.length - bad.length} of the ${rows.length} lags with 1 ≤ s < 2n − 1`),
      verdictLine(crossBad.length === 0, `N_A(s) + N_B(s) = 2N_Z(s) + 2N_W(s) at every lag <span class="small muted">(<code>concat_neg_autocorr_sum_fn</code>)</span>`),
      h("p", { class: "small muted", html:
        `Why: a product inside A pairs either two Z entries, two W entries, or one of each. The mixed products appear in B with one factor negated, so they cancel in the sum; the pure ones appear twice. ` +
        `That turns the base-sequence condition into the Turyn condition N_X + N_Y + 2N_Z + 2N_W = 0 — which is why ${decl("step1")} can hand ${decl("BaseSeqData")} a proof for every s ≥ 1. ` +
        `For s ≥ 2n − 1 every term is 0 on its own (<code>aperiodicAutocorr_zero_of_ge</code>), so the table above is the whole story.` }));
  }
  render();
}

// ============================================================================ pipeline
// The whole construction, one stage at a time: TT(n) → T-sequence → four ±1 vectors →
// circulants in the Goethals–Seidel array → a Hadamard matrix of order 4(3n − 1).
const PIPE = new Map();
const pipeMatrix = (key, q) => {
  if (!PIPE.has(key)) { const H = T.turynToHadamardMatrix(q); PIPE.set(key, { H, chk: T.hadamardCheck(H) }); }
  return PIPE.get(key);
};
const STAGE = ["the Turyn-type sequence", "step2: the T-sequence", "tseqCombine: four ±1 vectors",
  "the Goethals–Seidel array", "IsHadamardMat"];

function pipelineWidget(el, cfg = {}) {
  let key = resolvePreset(cfg.preset ?? "n2").key;
  const body = h("div");
  const pick = presetSelect(key, (k) => { key = k; st.go(0); }, ["n1", "n2", "n4", "tt6", "kh05"]);
  el.append(h("div", { class: "row" }, field("example", pick)));
  const st = stepper(STAGE.length - 1, (i) => draw(i), 0);
  el.append(st.bar, body,
    illustration("Illustration — not the Lean proof. `turynToHadamardMatrix_isHadamard` covers every TT(n) at once; each stage here is the same construction evaluated on one quadruple."));

  function draw(i) {
    const { q, label } = resolvePreset(key);
    const n = q.X.length, m = Math.max(0, 3 * n - 1), order = T.hadamardOrder(n);
    body.innerHTML = "";
    body.append(h("h4", {}, `${i}. ${STAGE[i]}`), h("p", { class: "small muted" }, label));
    if (i === 0) {
      const lags = T.lagTable(q), bad = lags.filter((r) => r.c !== 0);
      body.append(quadRows(q),
        lags.length ? lagChart(lags) : h("p", { class: "small muted" }, "n = 1: no lag to check"),
        verdictLine(bad.length === 0, `${ref("IsTurynType")}: all ${lags.length} combined autocorrelations vanish`),
        h("p", { class: "small muted", html: `n = ${n}, so the matrix at the end will have order ${ref("hadamardOrder")} n = 4(3n − 1) = <b>${order}</b>.` }));
    } else if (i === 1) {
      const t = T.step2(q), ok = T.tseqSupportOk(t);
      const lags = Array.from({ length: Math.max(0, m - 1) }, (_, k) => T.tseqPeriodic(t, k + 1));
      const badL = lags.filter((v) => v !== 0).length;
      body.append(
        h("p", { html: `${ref("step2")} spreads Z, W and the two halves (X±Y)/2 over m = 3n − 1 = <b>${m}</b> positions, giving a ${ref("TSequence")}.` }),
        h("div", { class: "scroll" }, ["a", "b", "c", "d"].map((r) => pmRow(r, t[r], { color: SEQ_COLOR[r],
          mark: (j) => (j < n ? "bz" : j < 2 * n - 1 ? "bw" : "bx") }))),
        verdictLine(ok, "<code>support</code>: exactly one of a, b, c, d is nonzero in each column"),
        verdictLine(badL === 0, `<code>periodic_vanishing</code>: P_a + P_b + P_c + P_d = 0 at all ${lags.length} lags s ≠ 0`));
    } else if (i === 2) {
      const t = T.step2(q), x = T.tseqCombine(t);
      const names = ["x1", "x2", "x3", "x4"];
      const allPm = names.every((k) => T.allPmOne(x[k]));
      const rows = Array.from({ length: Math.max(0, m - 1) }, (_, k) => {
        const s = k + 1;
        const left = names.reduce((a, nm) => a + T.periodicAutocorr(x[nm], s), 0);
        const right = 4 * T.tseqPeriodic(t, s);
        return { bad: left !== right, cells: [s, fmt(left), fmt(right), left === right ? "✓" : "✗"] };
      });
      body.append(
        h("p", { html: `${ref("gsDataOfTSequence")} combines the T-sequence four ways: x1 = a+b+c+d, x2 = a+b−c−d, x3 = a−b+c−d, x4 = a−b−c+d.` }),
        h("div", { class: "scroll" }, names.map((k) => pmRow(k, x[k], { color: SEQ_COLOR[k] }))),
        verdictLine(allPm, "every entry is ±1 — one of a, b, c, d is ±1 and the others are 0, so the four signs just reshuffle it"),
        bigTable(["s", "Σ P_{x_i}(s)", "4 · Σ P(s)", "equal?"], rows),
        verdictLine(rows.every((r) => !r.bad), `${ref("tseqCombine_periodic_identity")}: the combined periodic autocorrelation is 4 × the T-sequence's — so it vanishes too`));
    } else if (i === 3) {
      const slot = h("div", {}, h("p", { class: "small muted" }, `building the ${order} × ${order} matrix…`));
      body.append(
        h("p", { html: `Each x_i becomes a circulant m × m block (m = ${m}); ${ref("gsMatrix")} lays A, B, C, D out in the 4 × 4 Goethals–Seidel array, so the matrix has order 4m = <b>${order}</b>. The same matrix is ${ref("turynToHadamardMatrix")} of the quadruple.` }),
        slot);
      defer(() => {
        const { H } = pipeMatrix(key, q);
        slot.innerHTML = "";
        slot.append(matrixCanvas(H, { blocks: m }), pmLegend(),
          h("p", { class: "small muted" }, "Orange lines are the block boundaries. Each block is constant along its diagonals (possibly reversed, transposed or negated) — that is all a circulant is."));
      });
    } else {
      const slot = h("div", {}, h("p", { class: "small muted" }, `multiplying H · Hᵗ (${order} × ${order})…`));
      body.append(slot);
      defer(() => {
        const { H, chk } = pipeMatrix(key, q);
        slot.innerHTML = "";
        slot.append(
          h("p", { html: `${ref("IsHadamardMat")} wants two things, and here they are:` }),
          verdictLine(chk.pm, "every entry of H is ±1"),
          verdictLine(chk.badEntries === 0, `H · Hᵗ = n · I with n = ${order} ${chk.badEntries ? `— <span class="err">${chk.badEntries} entries wrong</span>` : ""}`),
          matrixCanvas(chk.gram, { max: 200, colorOf: (v, r, c) => (r === c ? (v === order ? "#a6e22e" : "#f92672") : v === 0 ? "#26271f" : "#f92672") }),
          h("div", { class: "row small legend-row" }, h("span", {}, swatch("#a6e22e"), `${order} on the diagonal`),
            h("span", {}, swatch("#26271f"), "0 off it")),
          h("p", { class: "small muted", html: `That is ${refs("typedGsMatrix_isHadamard", "turynToHadamardMatrix_isHadamard")} for this one case. ${H.length === order ? "" : "(order mismatch!)"}` }));
      });
    }
  }
  draw(0);
}
const defer = (f) => (typeof setTimeout === "function" ? setTimeout(() => { try { f(); } catch (e) { if (typeof console !== "undefined") console.error(e); } }, 0) : f());

const REGISTRY = { outline: outlineWidget, walkthrough: walkthroughWidget, energy: energyWidget,
  moves: movesWidget, "xy-law": xyLawWidget, "base-seq": baseSeqWidget, pipeline: pipelineWidget, ...INTERACTIVE };

export function mountWidget(container, spec) {
  const box = h("div", { class: "widget" });
  if (spec.title) box.append(h("h3", {}, spec.title));
  container.append(box);
  const f = REGISTRY[spec.type];
  if (!f) { box.append(h("p", { class: "err" }, `unknown widget ${spec.type}`)); return; }
  try { f(box, spec.config || {}); } catch (e) { box.append(h("p", { class: "err" }, e.message)); }
}
export const WIDGET_TYPES = Object.keys(REGISTRY);
