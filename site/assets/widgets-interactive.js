// Hands-on, drawing-heavy widgets for the Turyn library. Each one is mount(el, config).
// All the arithmetic lives in turyn.js, where every function mirrors a named Lean definition
// and is covered by tools/test_widgets.mjs. The shared pieces exported here — the preset list,
// the ±1 strips, the lag chart, the matrix canvas — are reused by the table-shaped widgets in
// widgets.js. Nothing here proves anything: a widget computes one case, the Lean covers all n.
import * as T from "./turyn.js";
import { h, svg, esc, field, btn, yes, select, num, illustration } from "./dom.js";

// ---------------------------------------------------------------- shared: colours
// One colour per sequence, used consistently by every widget. Signs are never carried by
// colour alone: every cell also prints its + / − / 0 glyph.
export const SEQ_COLOR = {
  X: "var(--pink)", Y: "var(--green)", Z: "var(--blue)", W: "var(--yellow)",
  A: "var(--blue)", B: "var(--purple)", C: "var(--pink)", D: "var(--green)",
  a: "var(--blue)", b: "var(--yellow)", c: "var(--pink)", d: "var(--green)",
  x1: "var(--blue)", x2: "var(--yellow)", x3: "var(--pink)", x4: "var(--green)",
};
const PLUS_FILL = "#f2f2e8", MINUS_FILL = "#26271f", ZERO_FILL = "#75715e";

export const swatch = (color) => h("span", { class: "sw", style: `background:${color}` });

// ---------------------------------------------------------------- shared: presets
// Every widget offers the same quadruples, so a reader can carry one example across the site.
const Q = (x, y, z, w) => ({ X: T.parsePm(x), Y: T.parsePm(y), Z: T.parsePm(z), W: T.parsePm(w) });
export const cloneQ = (q) => ({ X: q.X.slice(), Y: q.Y.slice(), Z: q.Z.slice(), W: q.W.slice() });

export const randomQuad = (n = 6) => {
  const r = (k) => Array.from({ length: Math.max(0, k) }, () => (Math.random() < 0.5 ? -1 : 1));
  return { X: r(n), Y: r(n), Z: r(n), W: r(n - 1) };
};

/** Pad with +1 / truncate to make a quadruple of shape (n, n, n, n−1). */
export const resizeQuad = (q, n) => {
  const fit = (a, k) => Array.from({ length: Math.max(0, k) }, (_, i) => (i < a.length ? a[i] : 1));
  return { X: fit(q.X, n), Y: fit(q.Y, n), Z: fit(q.Z, n), W: fit(q.W, n - 1) };
};

export const PRESETS = {
  n1: { label: "TT(1) — order 8", q: () => Q("+", "+", "+", ""),
    note: "The shortest Turyn-type sequence: `1 ≤ s < 1` is empty, so the vanishing condition is vacuous." },
  n2: { label: "TT(2) — order 20", q: () => Q("+-", "+-", "--", "-") },
  n4: { label: "TT(4) — order 44", q: () => Q("+-+-", "+---", "-++-", "---") },
  tt6: { label: "TT(6) — order 68", q: () => cloneQ(T.TT6),
    note: "`tt6X … tt6W` from Examples.lean, where `tt6_valid` is proved by `native_decide`." },
  kh05: { label: "TT(36) Kharaghani–Tayfeh-Rezaie — order 428", q: () => cloneQ(T.KH05),
    note: "`kh05X … kh05W` from Examples.lean: the 2005 sequence behind the order-428 Hadamard matrix." },
  broken6: { label: "TT(6) with one entry flipped — NOT a TT", q: () => { const q = cloneQ(T.TT6); q.X[2] = -q.X[2]; return q; },
    note: "One flip in X is enough to break the vanishing condition at several lags." },
  random: { label: "random ±1 quadruple (almost never a TT)", q: (n) => randomQuad(n ?? 6) },
};
export const PRESET_KEYS = ["n1", "n2", "n4", "tt6", "kh05", "broken6"];
const ALIAS = { tt1: "n1", tt2: "n2", tt4: "n4", tt36: "kh05", kh: "kh05", broken: "broken6" };

/** Look a preset up by key (`tt1`/`n1` both work), optionally at a given length. */
export function resolvePreset(key, n) {
  const k = PRESETS[key] ? key : ALIAS[key] || "tt6";
  const q = PRESETS[k].q(n);
  return { key: k, q: n && k !== "random" ? resizeQuad(q, n) : q, label: PRESETS[k].label, note: PRESETS[k].note };
}

/** The shared preset <select>. `keys` defaults to the fixed examples (no `random`). */
export const presetSelect = (key, onchange, keys = PRESET_KEYS) =>
  select(keys, keys.includes(key) ? key : keys[0], onchange, keys.map((k) => PRESETS[k].label));

// ---------------------------------------------------------------- shared: ±1 strips
const glyph = (v) => (v === 1 ? "+" : v === -1 ? "−" : v === 0 ? "0" : String(v));
const cls = (v) => (v === 1 ? "p1" : v === -1 ? "m1" : "z0");

/** A strip of {0, ±1} cells. With `onflip` the cells are buttons (click or keyboard). */
export function pmStrip(a, { onflip, mark, title, cell = "" } = {}) {
  const strip = h("div", { class: "pmstrip" });
  a.forEach((v, i) => {
    const c = `pmc ${cls(v)} ${cell} ${mark ? mark(i, v) || "" : ""}`;
    const tip = title ? title(i, v) : `position ${i + 1}` + (onflip ? " — click to flip" : "");
    strip.append(onflip
      ? h("button", { class: c, title: tip, "aria-label": tip, onclick: () => onflip(i) }, glyph(v))
      : h("span", { class: c, title: tip }, glyph(v)));
  });
  return strip;
}

/** One labelled row: `label` in the sequence's colour, then the cells. */
export const pmRow = (label, a, opts = {}) =>
  h("div", { class: "pmrow" },
    h("span", { class: "lab", style: `color:${opts.color || SEQ_COLOR[label] || "var(--dim)"}` }, label),
    pmStrip(a, opts),
    opts.after == null ? null : h("span", { class: "small muted after" }, opts.after));

/** The four rows of a quadruple, inside one horizontal scroller so the columns stay aligned. */
export function quadRows(q, { onflip, mark, labels = ["X", "Y", "Z", "W"] } = {}) {
  const keys = ["X", "Y", "Z", "W"];
  return h("div", { class: "scroll" }, keys.map((k, r) => pmRow(labels[r], q[k], {
    color: SEQ_COLOR[k],
    onflip: onflip ? (i) => onflip(k, i) : null,
    mark: mark ? (i, v) => mark(k, i, v) : null,
    title: (i) => `${k}${i + 1} = ${glyph(q[k][i])}` + (onflip ? " — click to flip" : ""),
  })));
}

/** "X Y Z W" in +/− notation, the form `pm!` takes in the Lean. */
export const quadText = (q) => [q.X, q.Y, q.Z, q.W].map(T.showPm).join(" ");
/** Inverse of `quadText`; returns null when the four words are not all ±1. */
export function parseQuadText(s) {
  const parts = String(s).trim().split(/\s+/);
  if (parts.length !== 4) return null;
  const seqs = parts.map(T.parsePm);
  if (seqs.some((a) => a === null)) return null;
  return { X: seqs[0], Y: seqs[1], Z: seqs[2], W: seqs[3] };
}

// ---------------------------------------------------------------- shared: tables
/** A table that survives a hundred lags: the first `max` rows (plus every row flagged `bad`
 *  or `hit`) inline, the whole thing behind a <details>. */
export function bigTable(headers, rows, { max = 14 } = {}) {
  const tab = (rs) => h("div", { class: "scroll" }, h("table", { class: "t" },
    h("tr", {}, headers.map((x) => h("th", { html: x }))),
    rs.map((r) => h("tr", { class: r.bad ? "bad" : r.hit ? "on" : null }, r.cells.map((c) => h("td", { html: String(c) }))))));
  if (rows.length <= max) return tab(rows);
  const head = rows.slice(0, max).concat(rows.slice(max).filter((r) => r.bad || r.hit));
  return h("div", {}, tab(head),
    h("details", {}, h("summary", { class: "small" }, `show all ${rows.length} rows`), tab(rows)));
}

export const verdictLine = (ok, text) => h("p", { class: "verdict", html: `${ok ? "✓" : "✗"} ${text}` });

// ---------------------------------------------------------------- shared: the lag chart
const SERIES = [["N_X", "nx", 1, "var(--pink)"], ["N_Y", "ny", 1, "var(--green)"],
  ["2·N_Z", "nz", 2, "var(--blue)"], ["2·N_W", "nw", 2, "var(--yellow)"]];

/** Signed grouped bars, one group per lag s = 1 … n−1, with the combined C(s) marked.
 *  Groups where C(s) ≠ 0 are tinted: those are exactly the lags `IsTurynType` rules out. */
export function lagChart(rows, { height = 150 } = {}) {
  const vals = rows.flatMap((r) => [...SERIES.map(([, k, m]) => m * r[k]), r.c]);
  const top = Math.max(2, ...vals.map((v) => Math.abs(v)));
  const gw = 30, padL = 36, padB = 20, mid = height / 2;
  const w = padL + Math.max(1, rows.length) * gw + 10;
  const y = (v) => mid - (v / top) * (mid - 12);
  const step = Math.ceil(rows.length / 14);
  const parts = [];
  for (const v of [top, 0, -top]) {
    parts.push(svg("line", { x1: padL - 4, y1: y(v), x2: w - 4, y2: y(v), stroke: "var(--line)" }));
    parts.push(svg("text", { x: padL - 6, y: y(v) + 3, class: "ylab" }, String(v)));
  }
  rows.forEach((r, gi) => {
    const x0 = padL + gi * gw;
    if (r.c !== 0) parts.push(svg("rect", { x: x0, y: 2, width: gw - 2, height: height - 4, fill: "var(--pink)", opacity: 0.14 }));
    SERIES.forEach(([, k, m, col], si) => {
      const v = m * r[k], yy = Math.min(y(0), y(v));
      parts.push(svg("rect", { x: x0 + 2 + si * 6, y: yy, width: 5, height: Math.max(1, Math.abs(y(v) - y(0))), fill: col }));
    });
    const cy = y(r.c);
    parts.push(svg("path", { d: `M${x0 + 14},${cy - 5} L${x0 + 19},${cy} L${x0 + 14},${cy + 5} L${x0 + 9},${cy} Z`,
      fill: r.c === 0 ? "var(--dim)" : "var(--orange)", stroke: "#16170f", "stroke-width": 0.5 }));
    if (gi % step === 0) parts.push(svg("text", { x: x0 + 14, y: height + 13, class: "xlab" }, String(r.s)));
    parts.push(svg("rect", { x: x0, y: 0, width: gw - 2, height, fill: "transparent" },
      svg("title", {}, `s = ${r.s}: N_X = ${fmt(r.nx)}, N_Y = ${fmt(r.ny)}, 2N_Z = ${fmt(2 * r.nz)}, 2N_W = ${fmt(2 * r.nw)}, C = ${fmt(r.c)}`)));
  });
  const chart = svg("svg", { width: w, height: height + padB + 4, viewBox: `0 0 ${w} ${height + padB + 4}`,
    class: "lagsvg", role: "img", "aria-label": "per-lag autocorrelation bars" }, parts);
  const legend = h("div", { class: "row small legend-row" },
    h("span", { class: "muted" }, `lag s = 1 … ${rows.length}`),
    SERIES.map(([name, , , col]) => h("span", {}, swatch(col), name)),
    h("span", {}, h("span", { class: "sw diamond" }), "C(s) = N_X + N_Y + 2N_Z + 2N_W"),
    h("span", { class: "muted" }, "tinted group: C(s) ≠ 0"));
  return h("div", {}, h("div", { class: "scroll" }, chart), legend);
}

// ---------------------------------------------------------------- shared: matrix canvas
/** A ±1 (or 0/±1) matrix as pixels: +1 light, −1 dark, 0 grey. `blocks` draws block borders
 *  every `blocks` rows/columns; `onrow(i)` makes a click report the row it landed in. */
export function matrixCanvas(M, { max = 380, blocks = 0, onrow, colorOf } = {}) {
  const n = M.length || 1;
  const cell = Math.max(1, Math.floor(max / n));
  const px = n * cell;
  const cv = h("canvas", { width: px, height: px, class: "mat", role: "img",
    "aria-label": `${n} by ${n} matrix of ±1 entries`, style: `width:min(100%, ${Math.max(px, 160)}px)` });
  const ctx = cv.getContext ? cv.getContext("2d") : null;
  const color = colorOf || ((v) => (v === 1 ? PLUS_FILL : v === -1 ? MINUS_FILL : ZERO_FILL));
  if (ctx && ctx.createImageData) {
    const img = ctx.createImageData(px, px), d = img.data;
    const rgb = new Map();
    const parse = (c) => {
      if (!rgb.has(c)) {
        const hex = c.replace("#", "");
        rgb.set(c, [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2) || "80", 16) || 0));
      }
      return rgb.get(c);
    };
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const [r, g, b] = parse(color(M[i][j], i, j));
      for (let dy = 0; dy < cell; dy++) {
        let o = (((i * cell + dy) * px) + j * cell) * 4;
        for (let dx = 0; dx < cell; dx++) { d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255; o += 4; }
      }
    }
    if (ctx.putImageData) ctx.putImageData(img, 0, 0);
    if (blocks > 0 && ctx.fillRect) {
      ctx.fillStyle = "#fd971f";
      for (let k = blocks; k < n; k += blocks) { ctx.fillRect(0, k * cell - 0.5, px, 1); ctx.fillRect(k * cell - 0.5, 0, 1, px); }
    }
  }
  if (onrow && cv.addEventListener) {
    cv.classList && cv.classList.add("pickrow");
    cv.addEventListener("click", (ev) => {
      const r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : null;
      if (!r || !r.height) return;
      onrow(Math.max(0, Math.min(n - 1, Math.floor(((ev.clientY - r.top) / r.height) * n))));
    });
  }
  return cv;
}

/** One row of a matrix as a pixel strip (used for the entrywise product of two rows). */
export function vecCanvas(v, { max = 380, colorOf } = {}) {
  const n = v.length || 1, cell = Math.max(1, Math.floor(max / n)), px = n * cell, hgt = 18;
  const cv = h("canvas", { width: px, height: hgt, class: "mat strip", style: `width:min(100%, ${Math.max(px, 160)}px)` });
  const ctx = cv.getContext ? cv.getContext("2d") : null;
  const color = colorOf || ((x) => (x === 1 ? PLUS_FILL : x === -1 ? MINUS_FILL : ZERO_FILL));
  if (ctx && ctx.fillRect) for (let i = 0; i < n; i++) { ctx.fillStyle = color(v[i], i); ctx.fillRect(i * cell, 0, cell, hgt); }
  return cv;
}

export const pmLegend = () => h("div", { class: "row small legend-row" },
  h("span", {}, h("span", { class: "sw", style: `background:${PLUS_FILL}` }), "+1 (light)"),
  h("span", {}, h("span", { class: "sw", style: `background:${MINUS_FILL};border:1px solid var(--line)` }), "−1 (dark)"));

// ---------------------------------------------------------------- shared: misc
/** Run heavy work off the first paint, and never let it take the page down with it. */
const defer = (f) => (typeof setTimeout === "function" ? setTimeout(() => guard(f), 0) : guard(f));
const guard = (f) => { try { f(); } catch (e) { if (typeof console !== "undefined") console.error(e); } };
export const spinner = (text) => h("p", { class: "small muted" }, text);
/** `Element.append` renders a null child as the text "null"; this one drops it. */
export const appendAll = (parent, ...kids) => parent.append(...kids.filter((k) => k != null));
const fmt = (v) => (v > 0 ? `+${v}` : String(v));

// ============================================================================ seq-editor
// Four clickable rows and the per-lag picture of `combinedAutocorr`. This is the widget that
// makes `IsTurynType` concrete: the verdict is "did every one of the n−1 bars vanish".
function seqEditorWidget(el, cfg = {}) {
  const show = cfg.show || ["bars", "table"];
  let { q } = resolvePreset(cfg.preset ?? "tt6", cfg.n);
  const keys = [...PRESET_KEYS, "random"];
  const pick = presetSelect(cfg.preset ?? "tt6", (k) => { q = resolvePreset(k, k === "random" ? q.X.length : null).q; sync(); }, keys);
  const nIn = num(q.X.length, 1, 40, (v) => { q = resizeQuad(q, Math.max(1, Math.min(40, v || 1))); sync(); });
  const txt = h("input", { type: "text", class: "mono", spellcheck: "false", value: quadText(q),
    "aria-label": "X Y Z W in plus/minus notation" });
  const cells = h("div"), verdict = h("div"), out = h("div");
  txt.addEventListener("input", () => {
    const p = parseQuadText(txt.value);
    if (p && p.X.length >= 1 && p.X.length <= 40) { q = p; nIn.value = String(q.X.length); render(); }
  });
  el.append(
    h("div", { class: "row" }, field("example", pick), field("n =", nIn)),
    h("div", { class: "row" }, field("X Y Z W", txt)),
    h("p", { class: "small muted", html: "Click any cell to flip it. X, Y, Z have length n; W has length n − 1, as in <code>PmSeq n</code> and <code>PmSeq (n - 1)</code>." }),
    cells, verdict, out,
    illustration("Illustration — not the Lean proof. `IsTurynType` quantifies over every lag 1 ≤ s < n of *one* quadruple; this widget checks those n − 1 lags for the quadruple on screen."));

  function sync() { txt.value = quadText(q); nIn.value = String(q.X.length); render(); }
  function render() {
    const n = q.X.length, rows = T.lagTable(q), bad = rows.filter((r) => r.c !== 0);
    cells.innerHTML = "";
    cells.append(quadRows(q, { onflip: (k, i) => { q[k] = q[k].slice(); q[k][i] = -q[k][i]; sync(); } }));
    verdict.innerHTML = "";
    const errs = T.shapeErrors(q);
    verdict.append(errs.length
      ? h("p", { class: "err", html: `shape: ${errs.map(esc).join("; ")}` })
      : h("p", { html: `<b>IsTurynType</b>: ${yes(bad.length === 0)} &nbsp;<span class="small muted">(${rows.length - bad.length} of ${rows.length} lag${rows.length === 1 ? "" : "s"} vanish${rows.length === 1 ? "es" : ""}${bad.length ? `; first failure at s = ${bad[0].s}, C = ${fmt(bad[0].c)}` : ""})</span>` }));
    out.innerHTML = "";
    if (!rows.length) out.append(h("p", { class: "small muted" }, "n = 1: there is no lag to check, so every ±1 triple is a TT(1)."));
    if (show.includes("bars") && rows.length) out.append(lagChart(rows));
    if (show.includes("table") && rows.length) out.append(bigTable(["s", "N_X", "N_Y", "2·N_Z", "2·N_W", "C(s)"],
      rows.map((r) => ({ bad: r.c !== 0, cells: [r.s, fmt(r.nx), fmt(r.ny), fmt(2 * r.nz), fmt(2 * r.nw),
        `<b style="color:${r.c === 0 ? "var(--green)" : "var(--pink)"}">${fmt(r.c)}</b>`] }))));
    if (show.includes("energy")) {
      const lhs = T.energyLHS(q), rhs = T.energyRHS(n);
      out.append(h("p", { class: "small", html: `energy: x² + y² + 2z² + 2w² = ${lhs}, 6n − 2 = ${rhs} — ${lhs === rhs ? "<b style='color:var(--green)'>equal</b>" : "<b style='color:var(--pink)'>different</b>"}` }));
    }
  }
  render();
}

// ============================================================================ autocorr
// `aperiodicAutocorr` one lag at a time: slide a copy of the sequence under itself and add up
// the overlapping products. The guard `if s ≥ n then 0` is visible at the end of the slider.
function autocorrWidget(el, cfg = {}) {
  const given = T.parsePm(cfg.seq ?? "+-++-");
  let a = given && given.length ? given : T.parsePm("+-++-");
  let s = Math.max(0, Math.min(cfg.s ?? 2, a.length));
  const txt = h("input", { type: "text", class: "mono", value: T.showPm(a), spellcheck: "false", "aria-label": "sequence in plus/minus notation" });
  const slider = h("input", { type: "range", min: 0, max: a.length, value: s, class: "slide", "aria-label": "lag s" });
  const sNum = num(s, 0, a.length, (v) => { s = clampS(v); sync(); }, "4em");
  const cells = h("div"), out = h("div");
  const clampS = (v) => Math.max(0, Math.min(a.length, isNaN(v) ? 0 : v));
  txt.addEventListener("input", () => {
    const p = T.parsePm(txt.value);
    if (p && p.length >= 1 && p.length <= 40) { a = p; s = clampS(s); render(); }
  });
  slider.addEventListener("input", () => { s = clampS(+slider.value); sync(); });
  el.append(
    h("div", { class: "row" }, field("sequence a", txt),
      btn("random", () => { a = randomQuad(a.length).X; sync(); })),
    h("div", { class: "row" }, field("lag s =", slider), sNum),
    h("p", { class: "small muted" }, "Click a cell to flip it. N_a(s) adds up the products of the overlapping cells."),
    cells, out,
    illustration("Illustration — not the Lean proof. `aperiodicAutocorr a s` is the sum shown here; the Lean lemmas about it hold for every sequence and every lag."));

  function sync() { txt.value = T.showPm(a); slider.max = String(a.length); slider.value = String(s); sNum.value = String(s); render(); }
  function render() {
    const n = a.length;
    sNum.max = String(n);
    cells.innerHTML = ""; out.innerHTML = "";
    const over = Math.max(0, n - s);
    const prods = Array.from({ length: n }, (_, i) => (i >= s && s < n ? a[i - s] * a[i] : 0));
    cells.append(h("div", { class: "scroll" },
      pmRow("a", a, { color: "var(--blue)", onflip: (i) => { a = a.slice(); a[i] = -a[i]; sync(); },
        title: (i) => `a${i + 1} — click to flip` }),
      h("div", { class: "pmrow" }, h("span", { class: "lab", style: "color:var(--yellow)" }, "↳ a"),
        h("div", { class: "pmstrip" },
          Array.from({ length: Math.min(s, n + 1) }, () => h("span", { class: "pmc gap" }, " ")),
          a.map((v, i) => h("span", { class: `pmc ${cls(v)}${i + s >= n ? " off" : ""}`, title: `a${i + 1} under position ${i + s + 1}` }, glyph(v))))),
      h("div", { class: "pmrow" }, h("span", { class: "lab", style: "color:var(--orange)" }, "a·a"),
        h("div", { class: "pmstrip" },
          a.map((_, i) => (i < s || s >= n
            ? h("span", { class: "pmc gap" }, " ")
            : h("span", { class: `pmc ${cls(prods[i])}`, title: `a${i - s + 1}·a${i + 1}` }, glyph(prods[i]))))))));
    const sum = T.aperiodicAutocorr(a, s);
    out.append(h("p", { html: s >= n
      ? `<b>N_a(${s}) = 0</b> — the copy has slid clear of the original. The Lean returns this by its guard: <code>if s ≥ n then 0</code> (n = ${n}).`
      : `<b>N_a(${s}) = ${fmt(sum)}</b> &nbsp;<span class="small muted">= sum of the ${over} product cell${over === 1 ? "" : "s"} above${s === 0 ? `, and at s = 0 every product is a_i² = 1, so N_a(0) = n = ${n}` : ""}</span>` }));
    const all = Array.from({ length: n + 1 }, (_, k) => ({ hit: k === s, cells: [k, fmt(T.aperiodicAutocorr(a, k))] }));
    out.append(bigTable(["s", "N_a(s)"], all, { max: 12 }));
  }
  render();
}

// ============================================================================ tseq
// Step 2 of the pipeline: the T-sequence. Four length-(3n−1) rows whose supports tile the
// positions — exactly one nonzero per column — and whose periodic autocorrelations cancel.
function tseqWidget(el, cfg = {}) {
  let key = cfg.preset ?? "tt6";
  const pick = presetSelect(key, (k) => { key = k; render(); });
  const out = h("div");
  el.append(h("div", { class: "row" }, field("example", pick)), out,
    illustration("Illustration — not the Lean proof. `step2` builds this T-sequence for every TT(n) and `TSequence.support` / `periodic_vanishing` are proved in general; here you see one m = 3n − 1."));

  function render() {
    const { q, label, note } = resolvePreset(key);
    const n = q.X.length, m = Math.max(0, 3 * n - 1), t = T.step2(q);
    const isTT = T.isTurynType(q);
    const rows = ["a", "b", "c", "d"];
    const detail = h("p", { class: "small muted" }, "Tap a column to read it.");
    const blockOf = (i) => (i < n ? "Z" : i < 2 * n - 1 ? "W" : "(X±Y)/2");
    const mark = (i) => (i < n ? "bz" : i < 2 * n - 1 ? "bw" : "bx");
    const strips = h("div", { class: "scroll" },
      h("div", { class: "pmrow" }, h("span", { class: "lab" }, "i"),
        h("div", { class: "pmstrip" }, t.a.map((_, i) => h("span", { class: `pmc idx ${mark(i)}` }, String((i + 1) % 10))))),
      rows.map((r) => pmRow(r, t[r], {
        color: SEQ_COLOR[r], mark: (i) => mark(i),
        title: (i, v) => `${r}${i + 1} = ${glyph(v)} (block ${blockOf(i)})`,
        onflip: (i) => { detail.innerHTML = `position i = ${i + 1} of ${m}, block <b>${esc(blockOf(i))}</b>: ` +
          rows.map((k) => `${k} = ${glyph(t[k][i])}`).join(", ") + ` &nbsp; |a|+|b|+|c|+|d| = ${rows.reduce((s2, k) => s2 + Math.abs(t[k][i]), 0)}`; },
      })));
    const lags = Array.from({ length: Math.max(0, m - 1) }, (_, k) => {
      const s = k + 1, p = rows.map((r) => T.periodicAutocorr(t[r], s)), sum = p[0] + p[1] + p[2] + p[3];
      return { bad: sum !== 0, cells: [s, ...p.map(fmt), `<b style="color:${sum === 0 ? "var(--green)" : "var(--pink)"}">${fmt(sum)}</b>`] };
    });
    const supportOk = T.tseqSupportOk(t), badLags = lags.filter((r) => r.bad).length;
    out.innerHTML = "";
    out.append(
      h("p", { class: "small muted", html: `${esc(label)}${note ? " — " + esc(note).replace(/`([^`]+)`/g, "<code>$1</code>") : ""}` }),
      h("p", { html: `n = ${n}, so the T-sequence has length m = 3n − 1 = <b>${m}</b>. Blocks: ` +
        `<span class="tag bz">Z on [1, ${n}]</span> <span class="tag bw">W on [${n + 1}, ${2 * n - 1}]</span> <span class="tag bx">(X±Y)/2 on [${2 * n}, ${m}]</span>` }),
      strips, detail,
      verdictLine(supportOk, `<code>TSequence.support</code>: exactly one of a, b, c, d is nonzero in every column`),
      verdictLine(badLags === 0, `<code>TSequence.periodic_vanishing</code>: ${lags.length - badLags} of ${lags.length} lags give P_a + P_b + P_c + P_d = 0 ${isTT ? "" : "<span class='muted small'>(this quadruple is not a TT, so there is nothing to hold)</span>"}`),
      bigTable(["s", "P_a", "P_b", "P_c", "P_d", "sum"], lags),
      h("p", { class: "small muted", html: "c and d are the half-sum and half-difference of X and Y: for ±1 entries one of them is 0 and the other is ±1, which is why the four supports tile every column." }));
  }
  render();
}

// ============================================================================ gs-array
// Step 3: the four circulants and the Goethals–Seidel block array, exactly as the Lean
// `gsMatrixEntry` match writes it, next to the ±1 matrix it actually produces.
const GS_CELLS = [
  [["A", "x1", "gsA G ii jj"], ["B·R", "x2", "(gsB G * reversalMatrix n) ii jj"], ["C·R", "x3", "(gsC G * reversalMatrix n) ii jj"], ["D·R", "x4", "(gsD G * reversalMatrix n) ii jj"]],
  [["−B·R", "x2", "(-(gsB G * reversalMatrix n)) ii jj"], ["A", "x1", "gsA G ii jj"], ["Dᵗ·R", "x4", "trCirculant G.x4 ii jj"], ["−Cᵗ·R", "x3", "(-(trCirculant G.x3)) ii jj"]],
  [["−C·R", "x3", "(-(gsC G * reversalMatrix n)) ii jj"], ["−Dᵗ·R", "x4", "(-(trCirculant G.x4)) ii jj"], ["A", "x1", "gsA G ii jj"], ["Bᵗ·R", "x2", "trCirculant G.x2 ii jj"]],
  [["−D·R", "x4", "(-(gsD G * reversalMatrix n)) ii jj"], ["Cᵗ·R", "x3", "trCirculant G.x3 ii jj"], ["−Bᵗ·R", "x2", "(-(trCirculant G.x2)) ii jj"], ["A", "x1", "gsA G ii jj"]],
];

function gsArrayWidget(el, cfg = {}) {
  let key = cfg.preset ?? "tt6";
  const pick = presetSelect(key, (k) => { key = k; render(); });
  const out = h("div");
  el.append(h("div", { class: "row" }, field("example", pick)), out,
    illustration("Illustration — not the Lean proof. The Lean builds this array for every T-sequence and proves `gsMatrix_isHadamard` in general; the picture below is one matrix."));

  function render() {
    const { q, label } = resolvePreset(key, cfg.n);
    const n = q.X.length, m = Math.max(0, 3 * n - 1);
    const t = T.step2(q), x = T.tseqCombine(t);
    const names = ["x1", "x2", "x3", "x4"];
    const allPm = names.every((k) => T.allPmOne(x[k]));
    const detail = h("p", { class: "small muted" }, "Tap a block for its Lean clause.");
    const schem = h("table", { class: "t gs" },
      GS_CELLS.map((r, bi) => h("tr", {}, r.map((c, bj) => h("td", {
        class: `gsc ${c[1]}`, title: `gsMatrixEntry: | ${bi}, ${bj} => ${c[2]}`,
        onclick: () => { detail.innerHTML = `block (${bi}, ${bj}) &nbsp; <code>| ${bi}, ${bj} =&gt; ${esc(c[2])}</code>`; },
      }, c[0])))));
    out.innerHTML = "";
    appendAll(out, h("p", { class: "small muted" }, label + (cfg.n ? ` (resized to n = ${n})` : "")),
      T.isTurynType(q) ? null : h("p", { class: "note-added small", html:
        "This quadruple is <b>not</b> a TT, so the blocks below are still ±1 circulants — <code>support</code> alone gives that — but their products will not cancel and the matrix is not Hadamard." }),
      h("p", { html: `A = circulant x1, B = circulant x2, C = circulant x3, D = circulant x4, each m × m with m = ${m}; R is the reversal matrix and Xᵗ·R is <code>trCirculant</code>. The array is 4 × 4, so the matrix has order 4m = <b>${4 * m}</b>.` }),
      h("div", { class: "scroll" }, schem), detail,
      h("div", { class: "row small legend-row" }, names.map((k) => h("span", {}, swatch(SEQ_COLOR[k]), k))));
    out.append(h("h4", {}, "x1 … x4 = tseqCombine1 … 4 of the T-sequence"),
      h("div", { class: "scroll" }, names.map((k) => pmRow(k, x[k], { color: SEQ_COLOR[k] }))),
      verdictLine(allPm, `every entry of x1 … x4 is ±1 <span class="small muted">(<code>tseqCombine1_pmOne</code> … : it follows from <code>TSequence.support</code> alone)</span>`));
    const slot = h("div", {}, spinner(`building the ${4 * m} × ${4 * m} matrix…`));
    out.append(h("h4", {}, "the matrix itself"), slot);
    defer(() => {
      const H = T.gsMatrix(x);
      slot.innerHTML = "";
      slot.append(matrixCanvas(H, { blocks: m }),
        pmLegend(),
        h("p", { class: "small muted" }, `Orange lines mark the 4 × 4 block boundaries every m = ${m} rows and columns. Each block is a circulant (constant along its diagonals), possibly reversed, transposed or negated.`));
    });
  }
  render();
}

// ============================================================================ hadamard
// The end of the pipeline: a matrix, its row inner products, and the `IsHadamardMat` check.
const HCACHE = new Map();
const SOURCES = {
  tt1: { label: "TT(1) → order 8", preset: "n1" }, tt2: { label: "TT(2) → order 20", preset: "n2" },
  tt4: { label: "TT(4) → order 44", preset: "n4" }, tt6: { label: "TT(6) → order 68", preset: "tt6" },
  kh05: { label: "TT(36) Kharaghani–Tayfeh-Rezaie → order 428", preset: "kh05" },
  sylvester: { label: "Sylvester 2^k (not from this library)", preset: null },
};
function hadamardMatrix(source, k) {
  const ck = `${source}/${k}`;
  if (!HCACHE.has(ck)) {
    HCACHE.set(ck, source === "sylvester" ? T.sylvester(k) : T.turynToHadamardMatrix(resolvePreset(SOURCES[source].preset).q));
  }
  return HCACHE.get(ck);
}

function hadamardWidget(el, cfg = {}) {
  let source = SOURCES[cfg.source] ? cfg.source : "tt6";
  let k = Math.max(0, Math.min(cfg.k ?? 3, 7));
  let picked = [];
  const keys = Object.keys(SOURCES);
  const pick = select(keys, source, (v) => { source = v; picked = []; render(); }, keys.map((x) => SOURCES[x].label));
  const kIn = num(k, 0, 7, (v) => { k = Math.max(0, Math.min(v || 0, 7)); picked = []; render(); }, "4em");
  const kBox = h("span", {}, field("k =", kIn));
  const out = h("div");
  el.append(h("div", { class: "row" }, field("matrix", pick), kBox), out,
    illustration("Illustration — not the Lean proof. `turynToHadamardMatrix_isHadamard` is proved for every TT(n); this widget multiplies out one matrix and looks at the answer."));

  function render() {
    kBox.style && (kBox.style.display = source === "sylvester" ? "" : "none");
    out.innerHTML = "";
    const H = hadamardMatrix(source, k), n = H.length;
    if (picked.length !== 2) picked = [0, Math.min(1, n - 1)];   // start on two *different* rows
    const pm = H.every((r) => r.every((v) => v === 1 || v === -1));
    const rowsBox = h("div"), gramBox = h("div", {}, spinner(`multiplying H · Hᵗ (${n} × ${n})…`));
    const clampRow = (v) => Math.max(0, Math.min(n - 1, v || 0));
    const iIn = num(picked[0], 0, n - 1, (v) => { picked = [clampRow(v), picked[1]]; showRows(); }, "5em");
    const jIn = num(picked[1], 0, n - 1, (v) => { picked = [picked[0], clampRow(v)]; showRows(); }, "5em");
    out.append(
      h("p", { html: source === "sylvester"
        ? `Sylvester's doubling construction at k = ${k}: order 2^${k} = <b>${n}</b>. <b style="color:var(--orange)">Not from this library</b> — it is here only for comparison.`
        : `${esc(SOURCES[source].label)}: the pipeline <code>turynToHadamardMatrix</code> takes the quadruple to a matrix of order 4(3n − 1) = <b>${n}</b>.` }),
      matrixCanvas(H, { blocks: source === "sylvester" ? 0 : n / 4, onrow: (i) => { picked = [i, picked[0] ?? i]; iIn.value = String(picked[0]); jIn.value = String(picked[1]); showRows(); } }),
      pmLegend(),
      h("p", { class: "small muted" }, "Click the matrix to pick a row; the previous pick becomes the second row."),
      h("div", { class: "row" }, field("row i =", iIn), field("row j =", jIn)),
      rowsBox,
      h("h4", {}, "IsHadamardMat"), gramBox);
    function showRows() {
      const i = picked[0], j = picked[1];
      const prod = H[i].map((v, c) => v * H[j][c]);
      const sum = prod.reduce((s, v) => s + v, 0);
      rowsBox.innerHTML = "";
      rowsBox.append(
        h("p", { class: "small", html: `rows ${i} and ${j}, entrywise product:` }),
        vecCanvas(prod), pmLegend(),
        h("p", { html: `Σ_c H[${i}][c] · H[${j}][c] = <b style="color:${(i === j ? sum === n : sum === 0) ? "var(--green)" : "var(--pink)"}">${sum}</b> &nbsp;` +
          (i === j ? `<span class="small muted">same row: the sum of n = ${n} squares, so it must be n</span>`
            : `<span class="small muted">different rows: orthogonal means this is 0</span>`) }));
    }
    showRows();
    defer(() => {
      const chk = T.hadamardCheck(H);
      gramBox.innerHTML = "";
      gramBox.append(
        h("p", { html: `entries ±1 ${yes(pm, "✓", "✗")}, &nbsp; H · Hᵗ = n · I ${yes(chk.badEntries === 0, "✓", "✗")} &nbsp; (n = ${n})` +
          (chk.badEntries ? ` <span class="err">${chk.badEntries} wrong entries</span>` : "") }),
        matrixCanvas(chk.gram, { max: 200, colorOf: (v, r, c) => (r === c ? (v === n ? "#a6e22e" : "#f92672") : v === 0 ? "#26271f" : "#f92672") }),
        h("div", { class: "row small legend-row" },
          h("span", {}, swatch("#a6e22e"), `n on the diagonal`), h("span", {}, swatch("#26271f"), "0 off it"),
          h("span", {}, swatch("#f92672"), "anything else (none here if the check passed)")),
        h("p", { class: "small muted", html: "That is the whole of <code>IsHadamardMat</code>: entrywise ±1, and H · Hᵗ = n · I." }));
    });
  }
  render();
}

export const INTERACTIVE = {
  "seq-editor": seqEditorWidget,
  autocorr: autocorrWidget,
  tseq: tseqWidget,
  "gs-array": gsArrayWidget,
  hadamard: hadamardWidget,
};
