---
id: tt6_valid
title: "TT(6): the small worked example"
summary: "The four sequences `----+-`, `---+--`, `--+-++`, `-+++-` are Turyn-type: all five combined autocorrelations vanish."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Proved by `native_decide`, so `#print axioms` reports `Lean.ofReduceBool` and `Lean.trustCompiler` as well as the standard three. The kernel can do this one instead: `decide +kernel` proves the same statement in seconds with only `propext`, `Classical.choice` and `Quot.sound` (checked outside the repository, not committed — and it works at `n = 36` too). See [#/trust](#/trust)."
  - "This quadruple is **not** [Canonical1](#/node/Canonical1) — its first X entry is `-1`, not `+1` — so results with that hypothesis, such as [the XY law](#/node/Result.xy_interior_antipalindrome), do not apply to it as published. Negating all four sequences gives an [Equivalent](#/node/Equivalent) quadruple that is."
widgets:
  - type: seq-editor
    title: "The five lags of TT(6)"
    config: { preset: tt6, show: [bars, table, energy] }
  - type: energy
    title: "Its sums: −4, −4, 0, 1"
    config: { preset: tt6 }
quiz:
  - q: "How many lags does the vanishing condition cover at `n = 6`?"
    type: number
    answer: 5
    explain: "`1 ≤ s < 6`, so `s = 1, 2, 3, 4, 5`."
  - q: "What is the sum of the entries of `tt6Z = --+-++`?"
    type: number
    answer: 0
    explain: "Three `+1`s and three `-1`s. `tt6_sums` records `seqSum tt6Z.data = 0` (together with `-4`, `-4` for X and Y and `1` for W)."
  - q: "What is `N_W(5)` for `tt6W = -+++-`?"
    type: number
    answer: 0
    explain: "`tt6W` has length 5, and [aperiodicAutocorr](#/node/aperiodicAutocorr) begins `if s ≥ n then 0`. With `s = 5` and `n = 5` the guard fires, so the term is 0 — which is why the lag-5 row reads `N_X + N_Y + 2·N_Z + 0`."
  - q: "Is `tt6X 1 = 1` in the sense of [Canonical1](#/node/Canonical1)?"
    type: choice
    choices: ["yes", "no — `xAt tt6 1 = -1`, so this quadruple is not `Canonical1`"]
    answer: 1
    explain: "`tt6X = pm! \"----+-\"` starts with `-`. `Canonical1` wants all six of `xAt S 1, xAt S n, yAt S 1, yAt S n, zAt S 1, wAt S 1` to be `1`."
  - q: "What order of Hadamard matrix does this quadruple produce?"
    type: number
    answer: 68
    explain: "`4 * (3 * 6 - 1) = 4 * 17 = 68`. The matrix itself is [tt6_hadamard](#/node/tt6_hadamard)."
---

## Plain English

The same test as the famous `n = 36` case, at a size you can check by hand:

| | sequence | Σ |
|---|---|---|
| X | `- - - - + -` | −4 |
| Y | `- - - + - -` | −4 |
| Z | `- - + - + +` | 0 |
| W | `- + + + -` | 1 |

Slide each along itself by `s = 1, 2, 3, 4, 5`, form `N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s)`, and
every answer is 0. For example at `s = 1`: `N_X(1) = 1`, `N_Y(1) = 1`, `N_Z(1) = -1`,
`N_W(1) = 0`, and `1 + 1 + 2(−1) + 2(0) = 0`.

The sums also satisfy the [energy identity](#/node/energy_identity):
`(−4)² + (−4)² + 2·0² + 2·1² = 16 + 16 + 0 + 2 = 34 = 6·6 − 2`. The library records that
separately as `tt6_energy` and the four sums as `tt6_sums`.

## In the Lean

```
def tt6X : PmSeq 6 := pm! "----+-"
def tt6Y : PmSeq 6 := pm! "---+--"
def tt6Z : PmSeq 6 := pm! "--+-++"
def tt6W : PmSeq 5 := pm! "-+++-"

theorem tt6_valid : IsTurynType tt6X tt6Y tt6Z tt6W := by native_decide
```

Everything about shape is in the types: `PmSeq 6` already means "six entries, each `1` or `-1`".
[IsTurynType](#/node/IsTurynType) adds only the vanishing condition.

## Why it matters

This is the example the rest of the library is tested against: it is the input to
[tt6_hadamard](#/node/tt6_hadamard), a real 68 × 68 matrix whose Hadamard property is proved by
the general pipeline rather than by computation. If something in the construction were wrong, this
is where it would show.
