---
id: energy_identity
title: "Energy identity: x² + y² + 2z² + 2w² = 6n − 2"
summary: "For every Turyn-type quadruple of length `n ≥ 1`, the four sequence sums satisfy `x² + y² + 2z² + 2w² = 6n − 2`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The hypothesis `hn : n ≥ 1` is needed and is not decoration. At `n = 0` all four sums are 0 (the carriers are empty) while `6 · 0 − 2 = -2` over `Int`, so the identity would be false. It is used in the proof to rewrite the cast `((n - 1 : Nat) : Int)` as `(n : Int) - 1`."
  - "The input is the bundled [TurynType n](#/node/TurynType), so the vanishing condition is already inside `T`. There is no separate hypothesis for it."
  - "This is a *necessary* condition, not a characterization. A quadruple can satisfy the equation without being Turyn-type — all that is needed is for the lag sums to cancel in total, not one by one. Concretely, `X = Y = +++++-`, `Z = +++---`, `W = +++--` has sums 4, 4, 0, 1 and so energy 34 = 6·6 − 2, while its lag table is `16, 2, −8, −6, −4`, which adds to 0 but is nowhere near all-zero. (Found by brute force outside the Lean; the Lean states only the forward direction.)"
widgets:
  - type: energy
    title: "Both identities, side by side"
    config: { preset: tt6 }
  - type: walkthrough
    title: "The proof in four moves"
    config:
      steps:
        - text: "For each of the four sequences: (Σa)² = len + 2 · totalAutocorr a"
          lean: "rw [sum_sq_eq_len_add_two_totalAutocorr T.X.data T.X.pm, ...]"
          note: "Expand the square into diagonal terms (each aᵢ² = 1, giving the length) and off-diagonal terms (which group by lag)."
          uses: [sum_sq_eq_len_add_two_totalAutocorr]
        - text: "The four totals, weighted 1, 1, 2, 2, add up to the weighted total autocorrelation"
          lean: "rw [← weightedTotalAutocorr_decompose T.X.data T.Y.data T.Z.data T.W.data]"
          uses: [weightedTotalAutocorr_decompose]
        - text: "...and that is zero, because every single lag is zero"
          lean: "exact turyn_vanishing_total T"
          uses: [turyn_vanishing_total]
        - text: "What is left is n + n + 2n + 2(n − 1) = 6n − 2, once the cast of n − 1 is handled"
          lean: "have hcast : ((n - 1 : Nat) : Int) = (n : Int) - 1 := by omega"
          note: "This is the step that needs n ≥ 1."
quiz:
  - q: "What does the identity give at `n = 6`?"
    type: number
    answer: 34
    explain: "`6 · 6 − 2 = 34`. For [TT(6)](#/node/tt6_valid) the sums are −4, −4, 0, 1 and `16 + 16 + 0 + 2 = 34`."
  - q: "Why does the theorem assume `n ≥ 1`?"
    type: choice
    choices: ["to make the sequences non-empty for readability", "because at `n = 0` the left side is 0 and the right side is −2, so the statement is false", "because `aperiodicAutocorr` is undefined at `n = 0`", "it is not needed; the hypothesis is redundant"]
    answer: 1
    explain: "At `n = 0` all four carriers are empty — note `W : PmSeq (0 - 1) = PmSeq 0` by `Nat` subtraction — so every `seqSum` is 0, while `6 * (0 : Int) - 2 = -2`. The proof also uses `n ≥ 1` to turn `((n - 1 : Nat) : Int)` into `(n : Int) - 1`."
  - q: "Which weights do the four squares get?"
    type: choice
    choices: ["1, 1, 1, 1", "1, 1, 2, 2", "2, 2, 1, 1", "1, 2, 3, 4"]
    answer: 1
    explain: "`(seqSum X)² + (seqSum Y)² + 2 * (seqSum Z)² + 2 * (seqSum W)²` — the same weights that [combinedAutocorr](#/node/combinedAutocorr) puts on the four autocorrelations."
  - q: "At `n = 36`, what must `x² + y² + 2z² + 2w²` equal?"
    type: number
    answer: 214
    explain: "`6 · 36 − 2 = 214`. For the Kharaghani sequences the sums are 0, 6, 8, 5: `0 + 36 + 2·64 + 2·25 = 0 + 36 + 128 + 50 = 214` (recorded as `kh05_energy`)."
  - q: "True or false: any quadruple satisfying `x² + y² + 2z² + 2w² = 6n − 2` is Turyn-type."
    type: choice
    choices: ["True", "False"]
    answer: 1
    explain: "False, and the Lean never claims it. The identity follows from `Σ_s C(s) = 0`, which is weaker than `C(s) = 0` for every `s`. A counterexample to the converse: `X = Y = +++++-`, `Z = +++---`, `W = +++--`, whose lag table `16, 2, −8, −6, −4` sums to 0."
---

## ELI5

Add up the pluses and minuses in each of the four rows. Square the four answers, counting the last
two twice, and add them. You always get the same number — six times the length, minus two — no
matter which Turyn-type rows you started from.

## Plain English

Each sequence has a **sum**: `x = Σ Xᵢ`, and likewise `y`, `z`, `w`. These are integers of the same
parity as the length (a sum of `k` terms of `±1` is `k` mod 2). The theorem pins down one exact
combination of them:

```
x² + y² + 2z² + 2w² = 6n − 2
```

So the sums are not free. At `n = 36` they must satisfy `x² + y² + 2z² + 2w² = 214`, which is a
strong constraint: the admissible `(x, y, z, w)` are the integer points of an ellipsoid, so a
search program can enumerate those first and only then look for sequences realizing them.

Where does it come from? Two facts, both proved separately:

1. For *any* ±1 sequence `a` of length `k`, squaring the sum and collecting terms gives
   `(Σ a)² = k + 2 · Σ_{s≥1} N_a(s)`
   ([sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr)). The `k`
   is the diagonal (each `aᵢ² = 1`); the rest groups by lag.
2. For a Turyn-type quadruple, `Σ_{s≥1} (N_X + N_Y + 2N_Z + 2N_W)(s) = 0`
   ([turyn_vanishing_total](#/node/turyn_vanishing_total)) — trivially, since each term is 0.

Add the four instances of (1) with weights 1, 1, 2, 2. The lengths contribute
`n + n + 2n + 2(n − 1) = 6n − 2`, and the autocorrelation part is twice the quantity in (2),
hence 0.

## In the Lean

```
theorem energy_identity {n : Nat} (T : TurynType n) (hn : n ≥ 1) :
    (seqSum T.X.data) ^ 2 + (seqSum T.Y.data) ^ 2 +
    2 * (seqSum T.Z.data) ^ 2 + 2 * (seqSum T.W.data) ^ 2 =
    6 * (n : Int) - 2
```

[seqSum](#/node/seqSum) is `∑ i : Fin n, a i`, over the raw `Fin n → Int` carriers, reached through
`T.X.data`. The right-hand side lives in `Int`, with `(n : Int)` the cast of the length. The `W`
term contributes length `n - 1` as a `Nat`, and turning that cast into `(n : Int) - 1` is where
`hn` is spent.

## Why it matters

It is the cheapest useful necessary condition on a TT(n): one equation in four integers, checkable
before any autocorrelation is computed. The search engine in this repository is built around it —
`target_energy` in `src/types.rs` is `6n − 2`, and `src/enumerate.rs` enumerates the `(x, y, z, w)`
tuples satisfying the identity (with the parity constraints that `Turyn/PmSum.lean` proves) before
any sequence is looked at.
