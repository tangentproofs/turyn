---
id: seqSum
title: "seqSum: add up the entries"
summary: "`seqSum a = ∑ i : Fin n, a i`, the sum of all entries of a sequence."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It sums over `Fin n` directly, not over a `range` with [lookupNat](#/node/lookupNat). The private lemma `seqSum_eq_range_lookupNat` in `Turyn/Energy.lean` bridges the two forms, which is needed because the sum-of-squares expansion is done over `range n`."
  - "`seqSum` of an empty sequence is `0`. That is what makes [energy_identity](#/node/energy_identity) false at `n = 0` and so forces its `n ≥ 1` hypothesis."
widgets:
  - type: energy
    title: "The four sums, and what they have to satisfy"
    config: { preset: tt6 }
quiz:
  - q: "What is `seqSum` of `--+-++`?"
    type: number
    answer: 0
    explain: "Three `+1`s and three `-1`s. This is `tt6Z`, and `tt6_sums` records `seqSum tt6Z.data = 0`."
  - q: "For a ±1 sequence of length `k`, `seqSum` has the same parity as what?"
    type: choice
    choices: ["`k`", "always even", "always odd", "`k + 1`"]
    answer: 0
    explain: "A sum of `k` terms of ±1 differs from `k` by an even number (each `-1` costs 2). `Turyn/PmSum.lean` proves this as `sum_of_pm_ones_mod_two`."
  - q: "What is `seqSum` of a `PmSeq 0`?"
    type: number
    answer: 0
    explain: "The empty sum. This is why `energy_identity` needs `n ≥ 1`: at `n = 0` the left side is 0 and the right side is `-2`."
  - q: "Which index type does the sum range over?"
    type: choice
    choices: ["`Finset.range n`", "`Fin n` (as `Finset.univ`)", "`Nat`"]
    answer: 1
    explain: "`∑ i : Fin n, a i`, i.e. over `Finset.univ : Finset (Fin n)`. The `range`-based form appears inside the `Energy.lean` proofs via `Fin.sum_univ_eq_sum_range`."
---

## Plain English

```
def seqSum {n : Nat} (a : Fin n → Int) : Int := ∑ i : Fin n, a i
```

The number the [energy identity](#/node/energy_identity) is about. For a ±1 sequence of length
`k` it is `(number of +1s) − (number of −1s)`, so it lies in `[−k, k]` and has the same parity
as `k`. `Turyn/PmSum.lean` proves that parity fact (`sum_of_pm_ones_mod_two`,
`sum_of_pm_ones_odd_iff`), which the search side of the project uses to prune candidates.

For the two worked examples:

| | TT(6) | TT(36) |
|---|---|---|
| x | −4 | 0 |
| y | −4 | 6 |
| z | 0 | 8 |
| w | 1 | 5 |
| `x² + y² + 2z² + 2w²` | 34 | 214 |
| `6n − 2` | 34 | 214 |

(Those are `tt6_sums` and `kh05_sums`, both by `native_decide`.)

There is also a list version, `seqSumList`, which is not used by the headline results.
