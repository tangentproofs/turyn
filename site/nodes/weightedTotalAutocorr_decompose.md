---
id: weightedTotalAutocorr_decompose
title: "Summing by lag or by sequence gives the same answer"
summary: "`weightedTotalAutocorr x y z w = totalAutocorr x + totalAutocorr y + 2·totalAutocorr z + 2·totalAutocorr w`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The only subtle point is the W term. `weightedTotalAutocorr` sums lags `1 … n − 1`, but `totalAutocorr w` for `w : Fin (n - 1) → Int` sums lags `1 … n − 2`. The missing term, at lag `n − 1`, is `0` because the lag has reached W's length — that is the helper `sum_w_ext`."
  - "No ±1 hypothesis. It is pure `Finset` linearity, true for any integer-valued functions of the right shapes."
quiz:
  - q: "Which weights appear on the right-hand side?"
    type: choice
    choices: ["1, 1, 1, 1", "1, 1, 2, 2", "2, 2, 1, 1"]
    answer: 1
    explain: "The same weights as [combinedAutocorr](#/node/combinedAutocorr), pulled out of the sum by `← mul_sum`."
  - q: "Why does the `w` term need the helper lemma `sum_w_ext`?"
    type: choice
    choices: ["because `totalAutocorr` starts its sum at lag `0`", "because `w` has length `n − 1`, so `totalAutocorr w` sums only lags `1 … n − 2`, while the left-hand side runs to lag `n − 1`", "because the `w` term carries the weight `2`"]
    answer: 1
    explain: "`totalAutocorr` of a length-`k` sequence sums lags `1 … k − 1`, and here `k = n − 1`, so it stops one lag short of the left-hand side. `sum_w_ext` closes the gap: the missing term's lag equals W's length, so [aperiodicAutocorr](#/node/aperiodicAutocorr)'s guard makes it `0`. (`totalAutocorr` starts at lag 1, not 0, and the weight `2` is pulled out separately by `← mul_sum`.)"
  - q: "Does the lemma need the quadruple to be Turyn-type?"
    type: choice
    choices: ["yes", "no — it is an identity about four arbitrary integer sequences of shape `(n, n, n, n − 1)`"]
    answer: 1
    explain: "It takes the four raw carriers as arguments, with no hypothesis at all. The Turyn condition is used by its *caller*."
---

## Plain English

```
theorem weightedTotalAutocorr_decompose {n : Nat} (x y z : Fin n → Int) (w : Fin (n - 1) → Int) :
    weightedTotalAutocorr x y z w =
    totalAutocorr x + totalAutocorr y + 2 * totalAutocorr z + 2 * totalAutocorr w
```

A bookkeeping step, but a necessary one. The left-hand side is "for each lag, combine the four
sequences, then add over lags"; the right-hand side is "for each sequence, add over lags, then
combine". Finite sums commute, so the two agree — `simp only [sum_add_distrib, ← mul_sum]` does
most of it.

The one wrinkle is that `w` is a shorter sequence. [totalAutocorr](#/node/totalAutocorr) of a
sequence of length `k` runs over lags `1 … k − 1`, and here `k = n − 1`, so it stops at `n − 2`,
one short of the `n − 1` lags on the left. The missing term is `aperiodicAutocorr w (n - 1)`, whose
lag equals W's own length, so the guard `if s ≥ n then 0` fires and it is `0`. The helper lemma
`sum_w_ext` makes that precise, by cases on `n` (both `n = 0` and `n = 1` are handled by `rfl`).

With that in hand, [energy_identity](#/node/energy_identity) is a short calculation: expand four
squares, combine with these weights, and use
[turyn_vanishing_total](#/node/turyn_vanishing_total) to kill the whole autocorrelation part.
