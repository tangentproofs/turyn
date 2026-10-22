---
id: Result.xy_interior_antipalindrome
title: "The X·Y products are an anti-palindrome in the middle"
summary: "For a Turyn-type quadruple of length `n ≥ 4` whose six endpoint signs are `+1`, the products `uₖ = xₖ · yₖ` satisfy `u_(n+1−k) = −uₖ` at every interior position `2 ≤ k ≤ n − 1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The hypothesis is only [Canonical1](#/node/Canonical1) — the six endpoint signs — not the full six-part [Canonical](#/node/Canonical). `Challenge.lean`'s docstring says 'a canonical Turyn sequence', which is looser than the Lean; the Lean asks for `Canonical1 n S` and nothing else."
  - "The input is the bundled [TurynType n](#/node/TurynType) record, not a loose `IsTurynType` certificate. If you have the latter, convert with [IsTurynType.toTyped](#/node/IsTurynType.toTyped)."
  - "The published [TT(6)](#/node/tt6_valid) is *not* `Canonical1` (its `xAt 1` is `-1`), so the theorem does not apply to it as written. Negating all four sequences (four of the ten [Elementary](#/node/Elementary) moves) gives an equivalent quadruple that is `Canonical1`, and the law then applies at k = 2, 3, 4, 5."
  - "Outside the Lean: because the relation pairs `k` with `n + 1 − k`, an odd `n ≥ 5` would force `u` at `k = (n+1)/2` to equal its own negation, which is impossible for a ±1 value. So no `Canonical1` TT(n) exists for odd `n ≥ 5`. That corollary follows from this theorem plus `uAt_pm`, but no theorem in the library states it."
  - "The library also proves the restated corollary `xy_product_eq_neg_one`: `xAt S k * yAt S k * xAt S (n+1-k) * yAt S (n+1-k) = -1` on the same range."
widgets:
  - type: xy-law
    title: "The u table and the mirror check"
    config: { preset: tt6 }
  - type: outline
    title: "The shape of the proof (XY.lean, strong induction on k)"
    config:
      steps:
        - text: "Rewrite N_X(n−k) + N_Y(n−k) as a sum of k terms xᵢ·xⱼ·(1 + uᵢ·uⱼ) (T_k_as_U_sum)"
          note: "Uses yᵢ = xᵢ·uᵢ, which holds because xᵢ² = 1."
        - text: "Parity hammer: the vanishing condition makes N_X(n−k) + N_Y(n−k) ≡ 2 (mod 4)"
          note: "N_X + N_Y = −2(N_Z + N_W), and N_Z(s) + N_W(s) is odd for 1 ≤ s ≤ n − 2."
          hard: true
        - text: "Interior terms pair up and each pair is ≡ 0 (mod 4), by the induction hypothesis"
        - text: "So the two endpoint terms alone must be ≡ 2 (mod 4), which happens exactly when u_(n+1−k) = −uₖ"
        - text: "Base cases k = 2 and k = 3 are done directly from the endpoint signs"
          link: "Canonical1"
quiz:
  - q: "For which `k` does the conclusion hold?"
    type: choice
    choices: ["every `k` from 1 to `n`", "`2 ≤ k ≤ n - 1`", "`2 ≤ k ≤ n`", "only even `k`"]
    answer: 1
    explain: "The conclusion is `∀ k, 2 ≤ k → k ≤ n - 1 → uAt S (n + 1 - k) = -(uAt S k)`. The two ends, `k = 1` and `k = n`, are excluded — there `Canonical1` already forces `uAt = 1`, so `u_(n+1−k) = −uₖ` would be false."
  - q: "How many values of `k` does the theorem cover when `n = 6`?"
    type: number
    answer: 4
    explain: "`k ∈ {2, 3, 4, 5}`, that is `n - 2 = 4` values. They form two mirror pairs: (2, 5) and (3, 4)."
  - q: "Which hypothesis about canonicality does the theorem use?"
    type: choice
    choices: ["the full `Canonical n S` (all six rules)", "only `Canonical1 n S` (the six endpoint signs)", "`Canonical1` and `Canonical6`", "none"]
    answer: 1
    explain: "`(hc : Canonical1 n S)`. [Canonical1](#/node/Canonical1) asks that `xAt S 1`, `xAt S n`, `yAt S 1`, `yAt S n`, `zAt S 1` and `wAt S 1` all equal `1`. `Canonical2 … Canonical6` are never mentioned."
  - q: "Does the theorem apply to `S` with `n = 3`?"
    type: choice
    choices: ["yes", "no — the hypothesis `4 ≤ n` fails", "yes, but the conclusion is vacuous"]
    answer: 1
    explain: "`(hn : 4 ≤ n)` rules it out. (The range `2 ≤ k ≤ n - 1` would be non-empty at `n = 3`, namely `k = 2`, so this is a real restriction, not a vacuous one. `xy_base_k2` is proved under the weaker `3 ≤ n`, but the exported theorem asks for `4 ≤ n`.)"
  - q: "`uAt S i` is defined as what?"
    type: text
    answer: ["xAt S i * yAt S i", "xAt S i*yAt S i", "x_i y_i", "xAt*yAt"]
    explain: "`def uAt {n : Nat} (S : TurynType n) (i : Nat) : Int := xAt S i * yAt S i` — the pointwise product of X and Y at 1-indexed position `i`."
---

## Plain English

Take a Turyn-type quadruple and multiply X and Y position by position. Call the result
`u`: `uₖ = xₖ · yₖ`, so each `uₖ` is again `+1` or `-1`. If the quadruple has been normalized so
that its six endpoint signs are all `+1` ([Canonical1](#/node/Canonical1)) and `n ≥ 4`, then `u`
is **anti-symmetric about its middle on the interior**: reading `u` backwards and flipping every
sign gives `u` again, as long as you ignore the two outermost positions.

Concretely, at `n = 6` the claim is `u₅ = −u₂` and `u₄ = −u₃` (and, redundantly, `u₂ = −u₅`,
`u₃ = −u₄`, since `k` runs over the whole interior). The two ends are left out on purpose:
`Canonical1` forces `u₁ = x₁y₁ = 1` and `uₙ = xₙyₙ = 1`, so they are equal, not opposite.

The docstrings in `Challenge.lean` and `Turyn/XY.lean` credit the discovery of this law to codex
rather than to the literature.

## In the Lean

```
theorem xy_interior_antipalindrome {n : Nat} (S : TurynType n) (hn : 4 ≤ n)
    (hc : Canonical1 n S) :
    ∀ k, 2 ≤ k → k ≤ n - 1 → uAt S (n + 1 - k) = -(uAt S k)
```

Three things to read carefully.

- The indices are **1-based**. [uAt](#/node/uAt) is `xAt S i * yAt S i`, and
  [xAt](#/node/xAt) is `lookupNat S.X.data (i - 1)`: entry `i` of the paper's notation is entry
  `i - 1` of the `Fin n`-indexed carrier. Out of range, `lookupNat` returns `0`.
- `n + 1 - k` is `Nat` subtraction, but on the stated range `2 ≤ k ≤ n - 1` with `n ≥ 4` it never
  truncates: it lands back in `2 … n - 1`.
- The hypothesis is the whole of what is assumed. There is no `Canonical2 … Canonical6`, and no
  constraint relating X to Y beyond the endpoint signs and the vanishing condition packed into
  `S` itself.

The underlying theorem is [xy_product_law](#/node/xy_product_law) in `Turyn/XY.lean`; this node's
declaration is the thin re-export in `Results.lean` that comparator checks.

## Why it matters

The vanishing condition is a statement about sums; this is a statement about individual entries.
That makes it useful to a search program: once the endpoints are normalized, half of the `u`
values determine the other half, so the space of candidate (X, Y) pairs collapses. The proof route
is also pretty — everything comes out of counting `N_X + N_Y` modulo 4, where the Turyn condition
forces it to be `−2 · (odd)`.
