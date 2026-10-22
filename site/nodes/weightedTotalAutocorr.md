---
id: weightedTotalAutocorr
title: "weightedTotalAutocorr: add up all the lags of a quadruple"
summary: "`weightedTotalAutocorr x y z w = ∑_{s=1}^{n−1} C(s)`, where `C(s)` is the 1, 1, 2, 2-weighted combined autocorrelation."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The type fixes the shape: `x y z : Fin n → Int` and `w : Fin (n - 1) → Int`. No ±1 hypothesis is needed for the definition."
  - "It sums the same `n − 1` lags that [IsTurynType](#/node/IsTurynType) constrains. Being zero is *weaker* than being zero lag by lag — the summands can cancel. That is why it only gives a necessary condition, and why the energy identity is not a characterization of TT(n)."
widgets:
  - type: energy
    title: "The row labelled weightedTotalAutocorr"
    config: { preset: broken6 }
quiz:
  - q: "How many lags are summed, at length `n`?"
    type: choice
    choices: ["`n`", "`n - 1`", "`n - 2`", "`3n - 1`"]
    answer: 1
    explain: "`∑ i ∈ range (n - 1), combinedAutocorr x y z w (i + 1)`: lags 1 through `n − 1`."
  - q: "If `weightedTotalAutocorr x y z w = 0`, must `(x, y, z, w)` be Turyn-type?"
    type: choice
    choices: ["yes", "no — the individual `C(s)` could cancel each other"]
    answer: 1
    explain: "`turyn_vanishing_total` goes one way only. For instance `X = Y = +++++-`, `Z = +++---`, `W = +++--` at `n = 6` has lag table `16, 2, −8, −6, −4`, which sums to 0 while no single entry is 0 — so it satisfies the [energy identity](#/node/energy_identity) but is not Turyn-type."
  - q: "Which lengths does the definition require?"
    type: choice
    choices: ["all four of length `n`", "`n, n, n` and `n - 1`", "`n, n, n - 1, n - 1`"]
    answer: 1
    explain: "`(x y z : Fin n → Int) (w : Fin (n - 1) → Int)` — the shape is baked into the signature, unlike [combinedAutocorr](#/node/combinedAutocorr), which takes two independent lengths."
---

## Plain English

```
def weightedTotalAutocorr {n : Nat} (x y z : Fin n → Int) (w : Fin (n - 1) → Int) : Int :=
  ∑ i ∈ range (n - 1), combinedAutocorr x y z w (i + 1)
```

The single number you get by adding up the whole lag table. For a Turyn-type quadruple every
summand is `0`, so the total is `0` — that is [turyn_vanishing_total](#/node/turyn_vanishing_total),
and it is the only way the vanishing condition enters the proof of the
[energy identity](#/node/energy_identity).

The other half of that proof is
[weightedTotalAutocorr_decompose](#/node/weightedTotalAutocorr_decompose), which rearranges the
double sum: instead of "for each lag, combine the four sequences", read it as "for each sequence,
total its lags, then combine". Swapping the order of a finite sum is easy; what needs care is that
the W component is a shorter sequence, so its own `totalAutocorr` runs to `n − 2` while this sum
runs to `n − 1`. The extra term is `0`, and `sum_w_ext` says so.
