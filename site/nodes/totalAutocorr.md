---
id: totalAutocorr
title: "totalAutocorr: add up all the lags of one sequence"
summary: "`totalAutocorr a = ∑_{s=1}^{k−1} N_a(s)` for a sequence of length `k`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The sum starts at lag 1, not 0. Lag 0 would contribute `k` and is handled separately in [sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr)."
  - "It stops at `k − 1`, written in Lean as `range (k - 1)` with the body `aperiodicAutocorr a (i + 1)`. Going further would add nothing: lags `≥ k` are `0` by [aperiodicAutocorr](#/node/aperiodicAutocorr)'s guard. That fact (`sum_w_ext`) is used to reconcile the length-`n − 1` sequence W with a `range (n - 1)` sum."
  - "No ±1 hypothesis: it is defined for any `Fin k → Int`."
widgets:
  - type: energy
    title: "The totalAutocorr column"
    config: { preset: tt6 }
quiz:
  - q: "At `k = 6`, how many lags are summed?"
    type: number
    answer: 5
    explain: "`range (6 - 1)` with the body at lag `i + 1`: lags 1 through 5."
  - q: "What is `totalAutocorr` for `tt6Z = --+-++` (lags give `-1, 0, 1, -2, -1`)?"
    type: number
    answer: -3
    explain: "`-1 + 0 + 1 - 2 - 1 = -3`. Then `(Σ Z)² = 0` and `6 + 2·(-3) = 0` ✓, which is [sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr)."
  - q: "What is `totalAutocorr` of a sequence of length 1?"
    type: number
    answer: 0
    explain: "`range (1 - 1) = range 0` is empty. Consistently, `(Σ a)² = 1 = 1 + 2·0`."
  - q: "Does summing beyond lag `k − 1` change the value?"
    type: choice
    choices: ["yes", "no — all further terms are `0` by the guard in [aperiodicAutocorr](#/node/aperiodicAutocorr)"]
    answer: 1
    explain: "This is exactly the content of `sum_w_ext`, which lets the W component of [weightedTotalAutocorr](#/node/weightedTotalAutocorr) be summed over `range (n - 1)` instead of `range (n - 2)`."
---

## Plain English

```
def totalAutocorr {k : Nat} (a : Fin k → Int) : Int :=
  ∑ i ∈ range (k - 1), aperiodicAutocorr a (i + 1)
```

One number per sequence: all of its non-zero-lag autocorrelations, added together. The reason it is
a useful quantity is the identity

`(Σ a)² = k + 2 · totalAutocorr a`

which holds for every ±1 sequence ([sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr)).
So `totalAutocorr` is not independent information — it is `((Σ a)² − k)/2` — but writing it this
way is what makes the [energy identity](#/node/energy_identity) a two-line combination.

Note the `i + 1` offset: the sum is over `i ∈ range (k - 1)`, i.e. `i = 0, …, k − 2`, but the lag
used is `i + 1`, so lags `1, …, k − 1`.
