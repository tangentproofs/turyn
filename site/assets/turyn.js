// The arithmetic of the Turyn library, in JavaScript, for the widgets.
// Every function mirrors a definition in lean/Turyn/*.lean (named in its comment) and is
// covered by tools/test_widgets.mjs. Sequences are plain arrays of integers, 0-indexed,
// exactly like `Fin n → Int` in the Lean. Nothing here is a proof: the widgets *illustrate*.

/** `charToPm?` / `pm!` (TurynType.lean): '+' ↦ 1, '-' or '−' ↦ −1. Returns null on any other char. */
export function parsePm(s) {
  const out = [];
  for (const c of String(s).replace(/\s+/g, "")) {
    if (c === "+") out.push(1);
    else if (c === "-" || c === "−") out.push(-1);
    else return null;
  }
  return out;
}
export const showPm = (a) => a.map((v) => (v === 1 ? "+" : v === -1 ? "-" : v === 0 ? "0" : String(v))).join("");

/** `AllPmOne` (Defs.lean). */
export const allPmOne = (a) => a.every((v) => v === 1 || v === -1);
/** `AllSignOne` (Defs.lean). */
export const allSignOne = (a) => a.every((v) => v === 0 || v === 1 || v === -1);

/** `lookupNat` (Defs.lean): out of range reads as 0. */
export const lookupNat = (a, i) => (i >= 0 && i < a.length ? a[i] : 0);

/** `aperiodicAutocorr` (Defs.lean): N_a(s) = Σ_{i<n−s} a_i a_{i+s}; 0 when s ≥ n. */
export function aperiodicAutocorr(a, s) {
  const n = a.length;
  if (s >= n) return 0;
  let t = 0;
  for (let i = 0; i < n - s; i++) t += lookupNat(a, i) * lookupNat(a, i + s);
  return t;
}

/** `combinedAutocorr` (Defs.lean): N_X(s) + N_Y(s) + 2 N_Z(s) + 2 N_W(s). */
export const combinedAutocorr = (x, y, z, w, s) =>
  aperiodicAutocorr(x, s) + aperiodicAutocorr(y, s) + 2 * aperiodicAutocorr(z, s) + 2 * aperiodicAutocorr(w, s);

/** Shape check for a would-be TT(n): lengths (n, n, n, n−1), all entries ±1. */
export function shapeErrors({ X, Y, Z, W }) {
  const n = X.length, e = [];
  if (Y.length !== n) e.push(`Y has length ${Y.length}, X has length ${n}`);
  if (Z.length !== n) e.push(`Z has length ${Z.length}, X has length ${n}`);
  if (W.length !== Math.max(0, n - 1)) e.push(`W has length ${W.length}, it must be n − 1 = ${Math.max(0, n - 1)}`);
  for (const [k, a] of Object.entries({ X, Y, Z, W })) if (!allPmOne(a)) e.push(`${k} has an entry that is not ±1`);
  return e;
}

/** The lags `IsTurynType` (Defs.lean) quantifies over: 1 ≤ s < n, with the combined value at each. */
export function lagTable({ X, Y, Z, W }) {
  const n = X.length, rows = [];
  for (let s = 1; s < n; s++)
    rows.push({ s, nx: aperiodicAutocorr(X, s), ny: aperiodicAutocorr(Y, s), nz: aperiodicAutocorr(Z, s), nw: aperiodicAutocorr(W, s), c: combinedAutocorr(X, Y, Z, W, s) });
  return rows;
}

/** `IsTurynType` / `isTurynTypeBool` (Defs.lean / TurynType.lean), including the shape requirements
 *  that the Lean types `PmSeq n` and `PmSeq (n - 1)` enforce. */
export const isTurynType = (q) => shapeErrors(q).length === 0 && lagTable(q).every((r) => r.c === 0);

/** `seqSum` (TurynType.lean). */
export const seqSum = (a) => a.reduce((t, v) => t + v, 0);

/** `totalAutocorr` (Energy.lean): Σ_{s=1}^{k−1} N_a(s). */
export function totalAutocorr(a) {
  let t = 0;
  for (let s = 1; s < a.length; s++) t += aperiodicAutocorr(a, s);
  return t;
}
/** `weightedTotalAutocorr` (Energy.lean): Σ_{s=1}^{n−1} C(s). Zero for a TT (`turyn_vanishing_total`),
 *  and `energyLHS − energyRHS n = 2 · weightedTotalAutocorr` (`weightedTotalAutocorr_decompose`). */
export function weightedTotalAutocorr({ X, Y, Z, W }) {
  let t = 0;
  for (let s = 1; s < X.length; s++) t += combinedAutocorr(X, Y, Z, W, s);
  return t;
}
/** `energyLHS` (Energy.lean): x² + y² + 2z² + 2w². */
export const energyLHS = ({ X, Y, Z, W }) => seqSum(X) ** 2 + seqSum(Y) ** 2 + 2 * seqSum(Z) ** 2 + 2 * seqSum(W) ** 2;
/** `energyRHS` (Energy.lean): 6n − 2 (as an integer, so n = 0 gives −2). */
export const energyRHS = (n) => 6 * n - 2;

/** `hadamardOrder` (TSequence.lean): 4(3n − 1), with natural-number subtraction. */
export const hadamardOrder = (n) => 4 * Math.max(0, 3 * n - 1);

// ---------------------------------------------------------------- equivalence moves (BaseSequence.lean)
export const neg = (a) => a.map((v) => -v);                                   // negSeqFn / PmSeq.neg
export const reverse = (a) => a.slice().reverse();                             // reverseFn / PmSeq.reverse
export const alt = (a) => a.map((v, i) => (i % 2 === 0 ? v : -v));            // altSeqFn: entry i times (−1)^i
export const MOVES = {
  negX: (q) => ({ ...q, X: neg(q.X) }), negY: (q) => ({ ...q, Y: neg(q.Y) }),
  negZ: (q) => ({ ...q, Z: neg(q.Z) }), negW: (q) => ({ ...q, W: neg(q.W) }),
  revX: (q) => ({ ...q, X: reverse(q.X) }), revY: (q) => ({ ...q, Y: reverse(q.Y) }),
  revZ: (q) => ({ ...q, Z: reverse(q.Z) }), revW: (q) => ({ ...q, W: reverse(q.W) }),
  altAll: (q) => ({ X: alt(q.X), Y: alt(q.Y), Z: alt(q.Z), W: alt(q.W) }),
  swap: (q) => ({ ...q, X: q.Y, Y: q.X }),
};

// ---------------------------------------------------------------- 1-indexed accessors (Defs.lean)
/** `xAt`/`yAt`/`zAt`/`wAt`: `lookupNat a (i - 1)` with *natural* subtraction, so i = 0 reads entry 0. */
export const at1 = (a, i) => lookupNat(a, Math.max(0, i - 1));
export const at1Nat = at1;   // kept as an alias: the accessors are 1-indexed over Nat either way
export const uAt = (q, i) => at1Nat(q.X, i) * at1Nat(q.Y, i);
/** `Canonical1` (Defs.lean): x₁ = xₙ = y₁ = yₙ = z₁ = w₁ = 1 (1-indexed). */
export function canonical1(q) {
  const n = q.X.length;
  return at1Nat(q.X, 1) === 1 && at1Nat(q.X, n) === 1 && at1Nat(q.Y, 1) === 1 && at1Nat(q.Y, n) === 1 &&
    at1Nat(q.Z, 1) === 1 && at1Nat(q.W, 1) === 1;
}
/** The pairs `xy_product_law` (XY.lean) talks about: for 2 ≤ k ≤ n−1, u_{n+1−k} = −u_k. */
export function xyLawRows(q) {
  const n = q.X.length, rows = [];
  for (let k = 2; k <= n - 1; k++) rows.push({ k, j: n + 1 - k, uk: uAt(q, k), uj: uAt(q, n + 1 - k), ok: uAt(q, n + 1 - k) === -uAt(q, k) });
  return rows;
}
/** A cheap search for an endpoint-normalising sequence of moves (enough for the demo; the
 *  Lean's `step1_condition1` needs n even). Returns { q, moves } with canonical1(q), or null. */
export function normalizeEndpoints(q) {
  const seen = new Map([[key(q), []]]), queue = [q];
  while (queue.length) {
    const c = queue.shift(), path = seen.get(key(c));
    if (canonical1(c)) return { q: c, moves: path };
    if (path.length >= 6) continue;
    for (const [m, f] of Object.entries(MOVES)) {
      const d = f(c), k = key(d);
      if (!seen.has(k)) { seen.set(k, [...path, m]); queue.push(d); }
    }
  }
  return null;
}
const key = (q) => [q.X, q.Y, q.Z, q.W].map(showPm).join("|");

// ---------------------------------------------------------------- base sequences (BaseSequence.lean `step1`)
/** `step1`: A = Z ++ W, B = Z ++ (−W) (length 2n−1), C = X, D = Y (length n). */
export const step1 = ({ X, Y, Z, W }) => ({ A: [...Z, ...W], B: [...Z, ...neg(W)], C: X.slice(), D: Y.slice() });
/** The `BaseSeqData.vanishing` sum at lag s: N_A + N_B + N_C + N_D. */
export const baseCombined = ({ A, B, C, D }, s) => aperiodicAutocorr(A, s) + aperiodicAutocorr(B, s) + aperiodicAutocorr(C, s) + aperiodicAutocorr(D, s);

// ---------------------------------------------------------------- T-sequences (TSequence.lean)
/** `periodicAutocorr` (MatUtils.lean): P_a(s) = Σ_i a_i a_{(i+s) mod m}. */
export function periodicAutocorr(a, s) {
  const m = a.length;
  let t = 0;
  for (let i = 0; i < m; i++) t += a[i] * a[(i + s) % m];
  return t;
}
/** `step2` (TSequence.lean): four length-(3n−1) sequences with entries in {0, ±1}:
 *  a = Z on [0, n), b = W on [n, 2n−1), c = (X+Y)/2 and d = (X−Y)/2 on [2n−1, 3n−1); 0 elsewhere.
 *  (For X, Y = ±1 the sums are 0 or ±2, so the integer division by 2 is exact.) */
export function step2({ X, Y, Z, W }) {
  const n = X.length, m = Math.max(0, 3 * n - 1);
  const a = Array(m).fill(0), b = Array(m).fill(0), c = Array(m).fill(0), d = Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    if (i < n) a[i] = Z[i];
    else if (i < 2 * n - 1) b[i] = W[i - n];
    else { c[i] = (X[i - (2 * n - 1)] + Y[i - (2 * n - 1)]) / 2; d[i] = (X[i - (2 * n - 1)] - Y[i - (2 * n - 1)]) / 2; }
  }
  return { a, b, c, d };
}
/** `TSequence.support`: at each position exactly one of a, b, c, d is nonzero (|a|+|b|+|c|+|d| = 1). */
export const tseqSupportOk = ({ a, b, c, d }) => a.every((_, i) => Math.abs(a[i]) + Math.abs(b[i]) + Math.abs(c[i]) + Math.abs(d[i]) === 1);
/** `TSequence.periodic_vanishing`: the combined periodic value at lag s. */
export const tseqPeriodic = ({ a, b, c, d }, s) => periodicAutocorr(a, s) + periodicAutocorr(b, s) + periodicAutocorr(c, s) + periodicAutocorr(d, s);
export const tseqOk = (t) => tseqSupportOk(t) && [...Array(t.a.length).keys()].slice(1).every((s) => tseqPeriodic(t, s) === 0);

// ---------------------------------------------------------------- Goethals–Seidel (GoethalsSeidel.lean)
/** `tseqCombine1..4`: A+B+C+D, A+B−C−D, A−B+C−D, A−B−C+D (entries ±1 thanks to `support`). */
export const tseqCombine = ({ a, b, c, d }) => ({
  x1: a.map((_, i) => a[i] + b[i] + c[i] + d[i]),
  x2: a.map((_, i) => a[i] + b[i] - c[i] - d[i]),
  x3: a.map((_, i) => a[i] - b[i] + c[i] - d[i]),
  x4: a.map((_, i) => a[i] - b[i] - c[i] + d[i]),
});
const md = (i, m) => ((i % m) + m) % m;
/** `circulant` (MatUtils.lean): C[i][j] = x[(j − i) mod n]. */
export const circulant = (x) => x.map((_, i) => x.map((_, j) => x[md(j - i, x.length)]));
/** `reversalMatrix` (MatUtils.lean): R[i][j] = 1 iff j = n−1−i. */
export const reversalMatrix = (n) => [...Array(n).keys()].map((i) => [...Array(n).keys()].map((j) => (j === n - 1 - i ? 1 : 0)));
export const transpose = (M) => (M.length ? M[0].map((_, j) => M.map((r) => r[j])) : []);
export function mul(A, B) {
  const n = A.length, k = B.length, m = k ? B[0].length : 0;
  const C = [...Array(n)].map(() => Array(m).fill(0));
  for (let i = 0; i < n; i++) for (let t = 0; t < k; t++) { const v = A[i][t]; if (v) for (let j = 0; j < m; j++) C[i][j] += v * B[t][j]; }
  return C;
}
const negM = (M) => M.map((r) => r.map((v) => -v));
/** `trCirculant`: (circulant x)ᵀ · R. */
export const trCirculant = (x) => mul(transpose(circulant(x)), reversalMatrix(x.length));
/** `gsMatrixEntry` / `gsMatrix`: the 4×4 block array, block (bi, bj) as in the Lean `match`. */
export function gsMatrix({ x1, x2, x3, x4 }) {
  const n = x1.length, R = reversalMatrix(n);
  const A = circulant(x1), BR = mul(circulant(x2), R), CR = mul(circulant(x3), R), DR = mul(circulant(x4), R);
  const t2 = trCirculant(x2), t3 = trCirculant(x3), t4 = trCirculant(x4);
  const blocks = [
    [A, BR, CR, DR],
    [negM(BR), A, t4, negM(t3)],
    [negM(CR), negM(t4), A, t2],
    [negM(DR), t3, negM(t2), A],
  ];
  const H = [...Array(4 * n)].map(() => Array(4 * n).fill(0));
  for (let bi = 0; bi < 4; bi++) for (let bj = 0; bj < 4; bj++)
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) H[bi * n + i][bj * n + j] = blocks[bi][bj][i][j];
  return H;
}
/** `typedGsMatrixOfTSequence` ∘ `step2` = `turynToHadamardMatrix` (Hadamard.lean). */
export const turynToHadamardMatrix = (q) => gsMatrix(tseqCombine(step2(q)));

/** `IsHadamardMat` (Defs.lean): entries ±1 and H Hᵀ = n I. Returns details for display. */
export function hadamardCheck(H) {
  const n = H.length, G = mul(H, transpose(H));
  const pm = H.every((r) => r.every((v) => v === 1 || v === -1));
  let bad = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (G[i][j] !== (i === j ? n : 0)) bad++;
  return { n, pm, gram: G, badEntries: bad, ok: pm && bad === 0 };
}
/** Sylvester's doubling, for comparison in the matrix gallery (not in the Lean). */
export function sylvester(k) {
  let H = [[1]];
  for (let t = 0; t < k; t++) H = [...H.map((r) => [...r, ...r]), ...H.map((r) => [...r, ...r.map((v) => -v)])];
  return H;
}

// ---------------------------------------------------------------- data (Examples.lean, verbatim)
export const TT6 = { X: parsePm("----+-"), Y: parsePm("---+--"), Z: parsePm("--+-++"), W: parsePm("-+++-") };
export const KH05 = {
  X: parsePm("+++----++-+-+-----++++-++-++++----+-"),
  Y: parsePm("+-+++++--+-+--+--++--++++-++++---++-"),
  Z: parsePm("+-+++++-+--++++-+++-++--+++-+--+---+"),
  W: parsePm("+++-+-----++--+-+++--+-+-+++-++++-+"),
};
