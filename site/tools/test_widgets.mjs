// Tests for the widget logic, each assertion keyed to the Lean definition it mirrors.
// Run with `node tools/test_widgets.mjs` from site/ (also wired up as `npm test`).
//
// The arithmetic lives in assets/turyn.js; the last two groups mount every registered widget
// under a minimal fake DOM, which is enough to catch a widget that throws on load.
import assert from "node:assert/strict";
import * as T from "../assets/turyn.js";
import { stepper, clampStep } from "../assets/dom.js";   // uses `document` only inside its functions
import { WIDGET_TYPES, mountWidget } from "../assets/widgets.js";
import { PRESETS, PRESET_KEYS, resolvePreset, parseQuadText, quadText, resizeQuad } from "../assets/widgets-interactive.js";

let groups = 0;
const t = (name, f) => { f(); groups++; };

// ---------------------------------------------------------------- helpers used by the tests
const seqs = (k) => {
  const out = [];
  for (let m = 0; m < (1 << Math.max(0, k)); m++) {
    const a = [];
    for (let i = 0; i < k; i++) a.push((m >> i) & 1 ? 1 : -1);
    out.push(a);
  }
  return out;
};
const autocorrVec = (a, n) => Array.from({ length: Math.max(0, n - 1) }, (_, i) => T.aperiodicAutocorr(a, i + 1));

/** Every TT(n), by the Lean's own criterion. Instead of walking all 2^(4n−1) quadruples it
 *  groups the candidate Y's by their autocorrelation vector, since `combinedAutocorr` only
 *  sees X and Y through N_X + N_Y. */
function enumerateTT(n) {
  const ls = seqs(n), ws = seqs(n - 1), out = [];
  const byVec = new Map();
  for (const y of ls) {
    const k = autocorrVec(y, n).join(",");
    if (!byVec.has(k)) byVec.set(k, []);
    byVec.get(k).push(y);
  }
  for (const z of ls) {
    const vz = autocorrVec(z, n);
    for (const w of ws) {
      const vw = autocorrVec(w, n);
      const need = vz.map((v, i) => -2 * v - 2 * vw[i]);
      for (const x of ls) {
        const vx = autocorrVec(x, n);
        for (const y of byVec.get(need.map((v, i) => v - vx[i]).join(",")) || [])
          out.push({ X: x, Y: y, Z: z, W: w });
      }
    }
  }
  return out;
}
const TTS = { 1: enumerateTT(1), 2: enumerateTT(2), 3: enumerateTT(3), 4: enumerateTT(4) };
const SMALL = [...TTS[1], ...TTS[2], ...TTS[4]];
const randSeq = (k) => Array.from({ length: k }, () => (Math.random() < 0.5 ? -1 : 1));
const broken6 = PRESETS.broken6.q();

// ---------------------------------------------------------------- aperiodicAutocorr (Defs.lean)
t("aperiodicAutocorr: s = 0 is the length, s ≥ n is 0, lookupNat reads 0 out of range", () => {
  for (const a of [[1], [1, -1], ...seqs(4), T.TT6.X, T.KH05.W]) {
    assert.equal(T.aperiodicAutocorr(a, 0), a.length, T.showPm(a));          // ±1 ⇒ every term a_i² = 1
    for (const s of [a.length, a.length + 1, a.length + 7])
      assert.equal(T.aperiodicAutocorr(a, s), 0, `${T.showPm(a)} / s=${s}`); // `if s ≥ n then 0`
    for (let s = 1; s < a.length; s++) {
      let m = 0;
      for (let i = 0; i + s < a.length; i++) m += a[i] * a[i + s];
      assert.equal(T.aperiodicAutocorr(a, s), m);
      assert.ok(Math.abs(T.aperiodicAutocorr(a, s)) <= a.length - s);
    }
  }
  assert.equal(T.aperiodicAutocorr([], 0), 0);                                // n = 0: s ≥ n at once
  assert.equal(T.lookupNat([1, -1], 5), 0);
  assert.equal(T.lookupNat([1, -1], -1), 0);
  // the 1-indexed accessors use Nat subtraction, so i = 0 reads entry 0 (xAt/yAt/zAt/wAt)
  assert.equal(T.at1([7, 8, 9], 0), 7);
  assert.equal(T.at1([7, 8, 9], 1), 7);
  assert.equal(T.at1([7, 8, 9], 3), 9);
  assert.equal(T.at1([7, 8, 9], 4), 0);
});

t("combinedAutocorr / IsTurynType: the published examples hold, a single flip breaks it", () => {
  assert.ok(T.isTurynType(T.TT6), "tt6_valid");
  assert.ok(T.isTurynType(T.KH05), "kharaghani_2005_tt36");
  assert.equal(T.lagTable(T.TT6).length, 5);                                  // lags 1 ≤ s < n
  assert.equal(T.lagTable(T.KH05).length, 35);
  assert.ok(T.lagTable(T.KH05).every((r) => r.c === 0));
  assert.ok(!T.isTurynType(broken6));
  assert.ok(T.lagTable(broken6).some((r) => r.c !== 0));
  // every single-entry flip of TT(6) breaks it (the condition is tight, not slack)
  for (const k of ["X", "Y", "Z", "W"]) for (let i = 0; i < T.TT6[k].length; i++) {
    const q = { ...T.TT6, [k]: T.TT6[k].map((v, j) => (i === j ? -v : v)) };
    assert.ok(!T.isTurynType(q), `flip ${k}${i + 1}`);
  }
  // the shape requirements of `PmSeq n` / `PmSeq (n - 1)` are part of the check
  assert.ok(!T.isTurynType({ ...T.TT6, W: [...T.TT6.W, 1] }));
  assert.ok(!T.isTurynType({ ...T.TT6, X: T.TT6.X.map((v, i) => (i ? v : 0)) }));
  assert.deepEqual(T.parsePm("+-−"), [1, -1, -1]);                            // both minus signs
  assert.equal(T.parsePm("+x-"), null);
  assert.equal(T.showPm([1, -1, 0]), "+-0");
});

t("enumeration: 8 TT(1), 32 TT(2), no TT(3), 128 TT(4)", () => {
  assert.equal(TTS[1].length, 8);
  assert.equal(TTS[2].length, 32);
  assert.equal(TTS[3].length, 0);
  assert.equal(TTS[4].length, 128);
  for (const n of [1, 2, 3, 4]) for (const q of TTS[n]) {
    assert.ok(T.isTurynType(q), `n=${n}`);
    assert.equal(q.X.length, n);
    assert.equal(q.W.length, n - 1);
  }
  // n = 1 has no lag at all, so every ±1 triple qualifies: 2³ = 8
  assert.equal(TTS[1].length, 2 ** 3);
  // the grouped enumeration agrees with brute force at n = 2 (2⁷ = 128 quadruples)
  let brute = 0;
  for (const x of seqs(2)) for (const y of seqs(2)) for (const z of seqs(2)) for (const w of seqs(1))
    if (T.isTurynType({ X: x, Y: y, Z: z, W: w })) brute++;
  assert.equal(brute, 32);
});

// ---------------------------------------------------------------- Energy.lean
t("sum_sq_eq_len_add_two_totalAutocorr holds for every ±1 sequence, random ones included", () => {
  const cases = [...seqs(1), ...seqs(5), T.TT6.Z, T.KH05.Y, ...Array.from({ length: 40 }, () => randSeq(1 + Math.floor(Math.random() * 30)))];
  for (const a of cases)
    assert.equal(T.seqSum(a) ** 2, a.length + 2 * T.totalAutocorr(a), T.showPm(a));
  assert.equal(T.totalAutocorr([]), 0);
  assert.equal(T.totalAutocorr([1]), 0);                                      // range (k − 1) is empty
});

t("energy_identity: x² + y² + 2z² + 2w² = 6n − 2 for every TT, and the gap is 2·weightedTotalAutocorr", () => {
  for (const q of [...SMALL, T.TT6, T.KH05]) {
    const n = q.X.length;
    assert.equal(T.energyLHS(q), T.energyRHS(n), `n=${n}`);
    assert.equal(T.weightedTotalAutocorr(q), 0, "turyn_vanishing_total");
  }
  // the published sums (tt6_sums, kh05_sums)
  assert.deepEqual([T.TT6.X, T.TT6.Y, T.TT6.Z, T.TT6.W].map(T.seqSum), [-4, -4, 0, 1]);
  assert.deepEqual([T.KH05.X, T.KH05.Y, T.KH05.Z, T.KH05.W].map(T.seqSum), [0, 6, 8, 5]);
  assert.equal(T.energyLHS(T.TT6), 34);                                       // tt6_energy
  assert.equal(T.energyLHS(T.KH05), 214);                                     // kh05_energy
  // `energyLHS − energyRHS n = 2 · weightedTotalAutocorr` (weightedTotalAutocorr_decompose),
  // which is what makes the energy line fail for a non-TT
  for (const q of [broken6, ...Array.from({ length: 30 }, () => {
    const n = 2 + Math.floor(Math.random() * 7);
    return { X: randSeq(n), Y: randSeq(n), Z: randSeq(n), W: randSeq(n - 1) };
  })])
    assert.equal(T.energyLHS(q) - T.energyRHS(q.X.length), 2 * T.weightedTotalAutocorr(q), T.showPm(q.X));
  assert.notEqual(T.energyLHS(broken6), T.energyRHS(6));
  assert.equal(T.energyRHS(0), -2);                                           // 6n − 2 over the integers
});

// ---------------------------------------------------------------- BaseSequence.lean
t("every Elementary move keeps IsTurynType (and the shape)", () => {
  for (const q of [...SMALL, T.TT6, T.KH05]) for (const [m, f] of Object.entries(T.MOVES)) {
    const r = f(q);
    assert.ok(T.isTurynType(r), `${m} at n=${q.X.length}`);
    assert.deepEqual([r.X.length, r.Y.length, r.Z.length, r.W.length], [q.X.length, q.Y.length, q.Z.length, q.W.length]);
  }
  // the moves are involutions (neg, rev, alt, swap), so Equivalent is symmetric here
  for (const [m, f] of Object.entries(T.MOVES)) {
    const back = f(f(T.TT6));
    for (const k of ["X", "Y", "Z", "W"]) assert.deepEqual(back[k], T.TT6[k], `${m} twice`);
  }
  assert.deepEqual(T.alt([1, 1, 1, 1]), [1, -1, 1, -1]);                      // altSeqFn
  assert.deepEqual(T.reverse([1, -1, -1]), [-1, -1, 1]);
  assert.deepEqual(T.MOVES.swap(T.TT6).X, T.TT6.Y);
});

t("normalizeEndpoints lands on Canonical1 for every TT(4), TT(6) and TT(36)", () => {
  for (const q of [...TTS[4], T.TT6, T.KH05]) {
    const r = T.normalizeEndpoints(q);
    assert.ok(r, `no normalization found at n=${q.X.length}`);
    assert.ok(T.canonical1(r.q), "Canonical1 after normalizing");
    assert.ok(T.isTurynType(r.q), "still a TT");
    // the result really is reachable by the listed moves (Equivalent)
    let s = q;
    for (const m of r.moves) s = T.MOVES[m](s);
    for (const k of ["X", "Y", "Z", "W"]) assert.deepEqual(s[k], r.q[k]);
    assert.ok(r.moves.length <= 6);
  }
  assert.deepEqual(T.normalizeEndpoints(T.TT6).moves, ["negX", "negY", "negZ", "negW"]);
  assert.deepEqual(T.normalizeEndpoints(T.KH05).moves, ["altAll"]);           // one move is enough here
  assert.ok(!T.canonical1(T.TT6) && !T.canonical1(T.KH05), "neither example is canonical as published");
  assert.deepEqual(T.normalizeEndpoints(T.normalizeEndpoints(T.TT6).q).moves, []);
});

t("step1: N_A + N_B + N_C + N_D = 0 at every lag s ≥ 1, and N_A + N_B = 2N_Z + 2N_W", () => {
  for (const q of [...SMALL, T.TT6, T.KH05]) {
    const n = q.X.length, b = T.step1(q);
    assert.equal(b.A.length, 2 * n - 1);                                      // PmSeq (2n − 1)
    assert.equal(b.B.length, 2 * n - 1);
    assert.deepEqual(b.C, q.X);
    assert.deepEqual(b.D, q.Y);
    assert.ok(T.allPmOne(b.A) && T.allPmOne(b.B));
    for (let s = 1; s <= 3 * n + 2; s++) {
      assert.equal(T.baseCombined(b, s), 0, `n=${n} s=${s}`);
      assert.equal(T.aperiodicAutocorr(b.A, s) + T.aperiodicAutocorr(b.B, s),
        2 * T.aperiodicAutocorr(q.Z, s) + 2 * T.aperiodicAutocorr(q.W, s), `cross terms, n=${n} s=${s}`);
    }
  }
  // without the TT condition the base sum is just 2·C(s), so it fails exactly where C does
  const b = T.step1(broken6);
  assert.ok([1, 2, 3, 4, 5].some((s) => T.baseCombined(b, s) !== 0));
});

// ---------------------------------------------------------------- TSequence.lean
t("step2: support, {0,±1} entries, block layout, and periodic vanishing", () => {
  for (const q of [...SMALL, T.TT6, T.KH05]) {
    const n = q.X.length, m = 3 * n - 1, ts = T.step2(q);
    for (const k of ["a", "b", "c", "d"]) {
      assert.equal(ts[k].length, m);
      assert.ok(T.allSignOne(ts[k]), `AllSignOne ${k}`);
    }
    assert.ok(T.tseqSupportOk(ts), `support at n=${n}`);
    for (let i = 0; i < n; i++) assert.equal(ts.a[i], q.Z[i]);                // step2a: Z on [0, n)
    for (let i = n; i < 2 * n - 1; i++) assert.equal(ts.b[i], q.W[i - n]);    // step2b: W on [n, 2n−1)
    for (let i = 2 * n - 1; i < m; i++) {
      const j = i - (2 * n - 1);
      assert.equal(ts.c[i], (q.X[j] + q.Y[j]) / 2);                           // step2c, step2d
      assert.equal(ts.d[i], (q.X[j] - q.Y[j]) / 2);
      assert.equal(Math.abs(ts.c[i]) + Math.abs(ts.d[i]), 1);
    }
    for (let s = 1; s < m; s++) assert.equal(T.tseqPeriodic(ts, s), 0, `periodic_vanishing n=${n} s=${s}`);
    assert.ok(T.tseqOk(ts));
    assert.equal(T.periodicAutocorr(ts.a, 0) + T.periodicAutocorr(ts.b, 0) +
      T.periodicAutocorr(ts.c, 0) + T.periodicAutocorr(ts.d, 0), m, "s = 0 is excluded for a reason");
  }
  // support needs only ±1 inputs; the periodic vanishing is what needs the TT condition
  assert.ok(T.tseqSupportOk(T.step2(broken6)));
  assert.ok(!T.tseqOk(T.step2(broken6)));
});

t("tseqCombine: entries ±1, and the periodic autocorrelations are 4× the T-sequence's", () => {
  for (const q of [...SMALL, T.TT6, T.KH05, broken6]) {
    const m = 3 * q.X.length - 1, ts = T.step2(q), x = T.tseqCombine(ts);
    for (const k of ["x1", "x2", "x3", "x4"]) {
      assert.equal(x[k].length, m);
      assert.ok(T.allPmOne(x[k]), `tseqCombine ${k} is ±1`);                  // tseqCombine1_pmOne …
    }
    for (let s = 0; s < m; s++) {
      const left = ["x1", "x2", "x3", "x4"].reduce((acc, k) => acc + T.periodicAutocorr(x[k], s), 0);
      assert.equal(left, 4 * T.tseqPeriodic(ts, s), `tseqCombine_periodic_identity s=${s}`);
    }
    // for a TT that makes the combined value 0 at every s ≠ 0, which is what GSData needs
    if (T.isTurynType(q)) for (let s = 1; s < m; s++)
      assert.equal(["x1", "x2", "x3", "x4"].reduce((acc, k) => acc + T.periodicAutocorr(x[k], s), 0), 0);
  }
});

// ---------------------------------------------------------------- XY.lean
t("xy_product_law: u_{n+1−k} = −u_k for every Canonical1 TT at n = 4 and n = 6", () => {
  const canon4 = TTS[4].filter(T.canonical1);
  assert.ok(canon4.length > 0);
  for (const q of canon4) {
    const rows = T.xyLawRows(q);
    assert.equal(rows.length, 2);                                             // k = 2, 3
    for (const r of rows) {
      assert.ok(r.ok, `n=4 k=${r.k}`);
      assert.equal(r.uk * r.uj, -1, "xy_product_eq_neg_one");
      assert.equal(r.uk, T.at1(q.X, r.k) * T.at1(q.Y, r.k));                  // uAt is 1-indexed
    }
  }
  const tt6 = enumerateTT(6), canon6 = tt6.filter(T.canonical1);
  assert.equal(tt6.length, 1536);
  assert.ok(canon6.length > 0);
  for (const q of canon6) {
    assert.ok(T.isTurynType(q));
    for (const r of T.xyLawRows(q)) {
      assert.ok(r.ok, `n=6 k=${r.k}`);
      assert.equal(r.uk * r.uj, -1);
    }
  }
  // and via the moves, as the widget does: normalize TT(6) and the law appears
  const norm = T.normalizeEndpoints(T.TT6).q;
  assert.ok(T.canonical1(norm));
  assert.ok(T.xyLawRows(norm).every((r) => r.ok));
  assert.ok(T.xyLawRows(norm).length === 4);                                  // k = 2 … 5
  // Canonical1 is a hypothesis of the Lean theorem, but it is not what makes the conclusion
  // true: exhaustively, every TT(4), TT(6) (and TT(8), checked once by hand) satisfies the law
  // whether or not its endpoints are canonical. The widget says so rather than pretending.
  assert.ok(tt6.every((q) => T.xyLawRows(q).every((r) => r.ok)), "no TT(6) breaks the law");
  assert.ok(TTS[4].every((q) => T.xyLawRows(q).every((r) => r.ok)), "no TT(4) breaks the law");
  assert.ok(T.xyLawRows(T.TT6).every((r) => r.ok) && !T.canonical1(T.TT6));
  assert.ok(T.xyLawRows(T.KH05).every((r) => r.ok) && !T.canonical1(T.KH05));
  // a quadruple that is not a TT at all does break it, so the law is about TTs, not about ±1
  assert.ok(T.xyLawRows(broken6).some((r) => !r.ok) || !T.isTurynType(broken6));
  // n < 4 is outside the theorem; the table is then empty or tiny and we claim nothing
  assert.deepEqual(T.xyLawRows(TTS[1][0]), []);
  assert.equal(T.xyLawRows(TTS[2][0]).length, 0);
});

// ---------------------------------------------------------------- MatUtils / GoethalsSeidel
t("circulant, reversalMatrix and trCirculant match their Lean definitions", () => {
  const x = [1, -1, -1, 1];
  const C = T.circulant(x);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++)
    assert.equal(C[i][j], x[(((j - i) % 4) + 4) % 4], `circulant ${i},${j}`);  // x (j − i)
  const R = T.reversalMatrix(4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) assert.equal(R[i][j], j === 3 - i ? 1 : 0);
  assert.deepEqual(T.mul(R, R), T.reversalMatrix(4).map((r, i) => r.map((_, j) => (i === j ? 1 : 0))));
  assert.deepEqual(T.transpose(R), R);                                        // reversalMatrix_transpose
  assert.deepEqual(T.trCirculant(x), T.mul(T.transpose(T.circulant(x)), R));
  // periodicAutocorr wraps around; aperiodic does not
  assert.equal(T.periodicAutocorr([1, 1, 1, 1], 1), 4);
  assert.equal(T.periodicAutocorr(x, 0), 4);
  assert.equal(T.periodicAutocorr([1, -1], 1), -2);
});

t("gsMatrix of TT(1), TT(2), TT(4), TT(6) and TT(36) is a Hadamard matrix", () => {
  for (const [name, q] of [["TT(1)", TTS[1][0]], ["TT(2)", TTS[2][0]], ["TT(4)", TTS[4][0]],
    ["TT(6)", T.TT6], ["TT(36)", T.KH05]]) {
    const n = q.X.length, H = T.turynToHadamardMatrix(q);
    assert.equal(H.length, T.hadamardOrder(n), name);
    const chk = T.hadamardCheck(H);
    assert.ok(chk.pm, `${name}: entries ±1`);
    assert.equal(chk.badEntries, 0, `${name}: H Hᵗ = n I`);
    assert.ok(chk.ok, `${name}: IsHadamardMat`);
  }
  // the pipeline is the composition the Lean names
  const viaSteps = T.gsMatrix(T.tseqCombine(T.step2(T.TT6)));
  assert.deepEqual(T.turynToHadamardMatrix(T.TT6), viaSteps);
  // the blocks really are the ones gsMatrixEntry lists: block (0,0) is circulant x1
  const x = T.tseqCombine(T.step2(T.TT6)), m = x.x1.length, H = T.gsMatrix(x), A = T.circulant(x.x1);
  for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) {
    assert.equal(H[i][j], A[i][j]);                                           // 0,0 ↦ gsA
    assert.equal(H[m + i][m + j], A[i][j]);                                   // 1,1 ↦ gsA
    assert.equal(H[m + i][2 * m + j], T.trCirculant(x.x4)[i][j]);             // 1,2 ↦ trCirculant x4
    assert.equal(H[3 * m + i][j], -T.mul(T.circulant(x.x4), T.reversalMatrix(m))[i][j]); // 3,0 ↦ −(D·R)
  }
  // a non-TT runs through the construction and comes out wrong, which is the point
  const badH = T.turynToHadamardMatrix(broken6);
  assert.ok(T.hadamardCheck(badH).pm, "entries are still ±1 (support alone gives that)");
  assert.ok(T.hadamardCheck(badH).badEntries > 0, "but it is not Hadamard");
});

t("hadamardOrder = 4(3n − 1) with natural subtraction, and Sylvester is Hadamard", () => {
  assert.equal(T.hadamardOrder(36), 428);                                     // kh05_hadamard_order
  assert.equal(T.hadamardOrder(6), 68);                                       // tt6_hadamard : IntMat 68
  assert.equal(T.hadamardOrder(1), 8);
  assert.equal(T.hadamardOrder(2), 20);
  assert.equal(T.hadamardOrder(4), 44);
  assert.equal(T.hadamardOrder(0), 0);                                        // 3·0 − 1 = 0 in Nat
  for (let k = 0; k <= 5; k++) {
    const H = T.sylvester(k);
    assert.equal(H.length, 2 ** k);
    assert.ok(T.hadamardCheck(H).ok, `sylvester ${k}`);
  }
  // IsHadamardMat rejects the obvious non-examples
  assert.ok(!T.hadamardCheck([[1, 1], [1, 1]]).ok);
  assert.ok(!T.hadamardCheck([[1, 0], [0, 1]]).ok);
  assert.equal(T.hadamardCheck([[1]]).ok, true);
});

// ---------------------------------------------------------------- the shared preset list
t("every preset has the shape a TurynType needs, and only the broken one fails the check", () => {
  for (const k of PRESET_KEYS) {
    const { q, label } = resolvePreset(k);
    assert.ok(label, k);
    assert.deepEqual(T.shapeErrors(q), [], k);
    assert.equal(T.isTurynType(q), k !== "broken6", k);
    assert.equal(T.hadamardOrder(q.X.length), 4 * (3 * q.X.length - 1));
  }
  assert.equal(resolvePreset("n2").q.X.length, 2);
  assert.equal(resolvePreset("tt1").key, "n1");                               // alias
  assert.equal(resolvePreset("nonsense").key, "tt6");                         // fallback
  assert.equal(resolvePreset("random", 9).q.X.length, 9);
  assert.equal(resolvePreset("random", 9).q.W.length, 8);
  assert.deepEqual(T.shapeErrors(resolvePreset("random", 5).q), []);
  // the text box round-trips, and rejects anything that is not four ±1 words
  assert.equal(quadText(T.TT6), "----+- ---+-- --+-++ -+++-");
  assert.deepEqual(parseQuadText(quadText(T.TT6)), T.TT6);
  assert.equal(parseQuadText("+- +- --"), null);
  assert.equal(parseQuadText("+- +- -- x"), null);
  // resizing keeps the (n, n, n, n−1) shape at every length the editor allows
  for (let n = 1; n <= 40; n++) {
    const r = resizeQuad(T.TT6, n);
    assert.deepEqual([r.X.length, r.Y.length, r.Z.length, r.W.length], [n, n, n, n - 1]);
    assert.ok(T.allPmOne(r.X) && T.allPmOne(r.W));
  }
});

// ---------------------------------------------------------------- dom: the stepper contract
// The pipeline widget re-renders itself from the stepper's callback, so the stepper must not
// fire it while being constructed.
t("stepper clamps, and does not fire onset on construction", () => {
  installDom();
  assert.equal(clampStep(-3, 5), 0);
  assert.equal(clampStep(9, 5), 5);
  assert.equal(clampStep(2, 5), 2);
  const calls = [];
  const st = stepper(3, (i) => calls.push(i), 7);
  assert.deepEqual(calls, [], "onset must not fire during construction");
  assert.equal(st.index, 3, "i0 is clamped to total");
  st.go(1); st.go(-5); st.go(99);
  assert.deepEqual(calls, [1, 0, 3]);
  assert.equal(st.index, 3);
  removeDom();
});

// ---------------------------------------------------------------- a fake DOM for the widgets
// Just enough of the DOM that mounting a widget exercises its render path: elements with
// children, attributes, listeners, an innerHTML string, and a stub 2D canvas context.
const ctx2d = () => ({
  fillStyle: "", strokeStyle: "", lineWidth: 1, font: "",
  fillRect() {}, strokeRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
  stroke() {}, fill() {}, fillText() {}, save() {}, restore() {}, scale() {}, translate() {},
  createImageData: (w, hh) => ({ width: w, height: hh, data: new Uint8ClampedArray(w * hh * 4) }),
  putImageData() {},
});

function mkNode(tag) {
  const node = {
    nodeType: 1, tagName: String(tag).toUpperCase(), children: [], attrs: {}, listeners: {},
    className: "", textContent: "", value: "", checked: false, disabled: false, _html: "",
    style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false },
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === "class") this.className = String(v); },
    getAttribute(k) { return this.attrs[k]; },
    removeAttribute(k) { delete this.attrs[k]; },
    addEventListener(k, f) { (this.listeners[k] = this.listeners[k] || []).push(f); },
    // faithful to the real Element.append, which renders a null child as the text "null"
    append(...kids) { for (const k of kids) this.children.push(k == null ? { nodeType: 3, textContent: String(k) } : k); },
    appendChild(k) { this.children.push(k); return k; },
    insertAdjacentHTML(_, html) { this._html += String(html); },
    querySelectorAll() { return []; },
    querySelector() { return null; },
    remove() {},
    getBoundingClientRect: () => ({ top: 0, left: 0, width: 200, height: 200 }),
    getContext: String(tag) === "canvas" ? () => ctx2d() : undefined,
  };
  Object.defineProperty(node, "innerHTML", {
    get() { return this._html; },
    set(v) { this._html = String(v); this.children.length = 0; },
  });
  return node;
}
// Declared as functions so the stepper test above can use them too.
function installDom() {
  globalThis.document = { createElement: mkNode, createElementNS: (_, tag) => mkNode(tag),
    createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) };
}
function removeDom() { delete globalThis.document; }

const walk = (node, f) => {
  if (!node || node.nodeType !== 1) return;
  f(node);
  for (const k of node.children || []) walk(k, f);
};
const strays = (node) => {
  const out = [];
  const go = (x) => {
    if (!x) return;
    if (x.nodeType === 3 && /^(null|undefined|false|\[object Object\])$/.test(x.textContent)) out.push(x.textContent);
    for (const k of x.children || []) go(k);
  };
  go(node);
  return out;
};
const findAll = (node, pred) => { const out = []; walk(node, (x) => { if (pred(x)) out.push(x); }); return out; };
const errors = (node) => [
  ...findAll(node, (x) => / ?\berr\b/.test(x.className)).map((x) => `<${x.tagName} class="${x.className}"> ${x.textContent || x._html}`),
  ...findAll(node, (x) => /class="[^"]*\berr\b/.test(x._html)).map((x) => `innerHTML: ${x._html.slice(0, 160)}`),
];
const click = (node, ev = {}) => (node.listeners.click || []).forEach((f) => f({ target: node, clientY: 7, ...ev }));
const buttons = (node) => findAll(node, (x) => x.tagName === "BUTTON");

// ---------------------------------------------------------------- the registry
t("WIDGET_TYPES is exactly the twelve widgets the node pages may ask for", () => {
  const expected = ["outline", "walkthrough", "seq-editor", "autocorr", "energy", "moves", "xy-law",
    "base-seq", "tseq", "gs-array", "hadamard", "pipeline"];
  assert.deepEqual([...WIDGET_TYPES].sort(), [...expected].sort());
  assert.equal(new Set(WIDGET_TYPES).size, 12);
});

// Roots stay alive after the test so the deferred heavy work (the big matrices) can be
// re-checked once the timers have run.
const MOUNTED = [];
const LOGGED = [];
const realError = console.error;

t("every widget mounts, renders and survives a click, under a fake DOM", () => {
  installDom();
  console.error = (...a) => LOGGED.push(a.map((x) => (x && x.stack) || String(x)).join(" "));
  const specs = [
    ["outline", { steps: [{ text: "TT(n)", link: "IsTurynType" }, { text: "Hadamard", note: "order 4(3n−1)", hard: true }] }],
    ["outline", {}],
    ["walkthrough", { steps: [{ text: "step1", link: "step1", lean: "def step1 …", uses: ["BaseSeqData"] }, { text: "step2" }] }],
    ["seq-editor", {}],
    ["seq-editor", { preset: "n1" }],
    ["seq-editor", { preset: "broken6", show: ["bars", "table", "energy"] }],
    ["seq-editor", { preset: "random", n: 12, show: ["table"] }],
    ["seq-editor", { preset: "kh05", show: ["bars"] }],
    ["autocorr", {}],
    ["autocorr", { seq: "+", s: 0 }],
    ["autocorr", { seq: "++--+-+", s: 9 }],
    ["autocorr", { seq: "", s: 3 }],
    ["autocorr", { seq: "not a sequence" }],
    ["energy", { preset: "n2" }],
    ["energy", { preset: "broken6" }],
    ["energy", { preset: "kh05" }],
    ["moves", { preset: "tt6" }],
    ["moves", { preset: "n1" }],
    ["xy-law", { preset: "tt6" }],
    ["xy-law", { preset: "n2" }],
    ["xy-law", { preset: "kh05" }],
    ["base-seq", { preset: "n4" }],
    ["base-seq", { preset: "tt6" }],
    ["tseq", { preset: "n2" }],
    ["tseq", { preset: "tt6" }],
    ["gs-array", { preset: "n1" }],
    ["gs-array", { preset: "n4" }],
    ["gs-array", { preset: "random", n: 3 }],
    ["hadamard", { source: "tt1" }],
    ["hadamard", { source: "tt2" }],
    ["hadamard", { source: "tt6" }],
    ["hadamard", { source: "sylvester", k: 3 }],
    ["pipeline", {}],
    ["pipeline", { preset: "n4" }],
    ["pipeline", { preset: "tt6" }],
  ];
  for (const [type, config] of specs) {
    const root = mkNode("div");
    MOUNTED.push([`${type} ${JSON.stringify(config)}`, root]);
    mountWidget(root, { type, title: type, config });
    const where = `${type} ${JSON.stringify(config)}`;
    assert.deepEqual(errors(root), [], `${where} reported an error`);
    assert.deepEqual(strays(root), [], `${where} rendered a stray null/undefined child`);
    assert.ok(findAll(root, (x) => x.className === "widget").length === 1, where);
    assert.ok(root.children[0].children.length > 1, `${where} rendered nothing`);
    // press every button once (flips, moves, stepper arrows, block picks) and re-check
    for (const b of buttons(root).slice(0, 40)) click(b);
    assert.deepEqual(errors(root), [], `${where} errored after a click`);
  }
  // the pipeline's stepper must walk all the way to the Hadamard check
  const proot = mkNode("div");
  MOUNTED.push(["pipeline stepped to the end", proot]);
  mountWidget(proot, { type: "pipeline", config: { preset: "n2" } });
  const fwd = buttons(proot).find((b) => b.attrs.title === "forward");
  assert.ok(fwd, "the pipeline widget has a forward button");
  for (let i = 0; i < 6; i++) { click(fwd); assert.deepEqual(errors(proot), [], `pipeline step ${i + 1}`); }
  // an unknown type is reported rather than thrown
  const root = mkNode("div");
  mountWidget(root, { type: "no-such-widget" });
  assert.equal(errors(root).length, 1);
});

// Deferred work (the big matrices, the H·Hᵗ checks) runs on a timer: let the timers drain with
// the fake DOM still installed, then make sure nothing was quietly swallowed.
await new Promise((r) => setTimeout(r, 400));
t("the deferred matrix work lands without errors", () => {
  for (const [where, root] of MOUNTED) {
    assert.deepEqual(errors(root), [], `${where} errored after its timer`);
    assert.deepEqual(strays(root), [], `${where} rendered a stray null/undefined child`);
  }
  assert.deepEqual(LOGGED, [], "a widget logged an error");
  console.error = realError;
  removeDom();
});

console.log(`widget logic: all ${groups} test groups passed`);
