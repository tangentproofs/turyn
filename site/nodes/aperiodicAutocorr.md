---
id: aperiodicAutocorr
title: "aperiodicAutocorr: sliding a sequence over itself"
summary: "`aperiodicAutocorr a s` shifts `a` by `s` places, multiplies the overlapping entries and adds them up; it is defined to be `0` as soon as `s ≥ n`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The guard `if s ≥ n then 0` makes this a total function on all of `Nat`, which is what lets [IsTurynType](#/node/IsTurynType) and [combinedAutocorr](#/node/combinedAutocorr) quantify over `Nat` rather than `Fin n`. It is not a theorem about the sum; it is part of the definition — although the sum over `range (n - s)` would be empty there anyway, so the two readings agree."
  - "At `s = 0` the definition gives `Σᵢ aᵢ²`, which is `n` for a ±1 sequence. Nothing in the vanishing condition ever looks at `s = 0`."
  - "'Aperiodic' means the shifted copy is *not* wrapped around; compare [periodicAutocorr](#/node/periodicAutocorr), which does wrap, and which is what the Hadamard side of the pipeline needs."
widgets:
  - type: autocorr
    title: "One lag at a time"
    config: { seq: "+-++-", s: 2 }
quiz:
  - q: "For `a` of length 5, what is `aperiodicAutocorr a 5`?"
    type: number
    answer: 0
    explain: "The guard `if s ≥ n then 0` fires, since `5 ≥ 5`."
  - q: "For a ±1 sequence of length `n`, what is `aperiodicAutocorr a 0`?"
    type: text
    answer: ["n", "the length", "len", "the length n"]
    explain: "The sum over `range (n - 0)` of `a i * a (i + 0) = a i ^ 2 = 1`, so it is `n`. (This is the diagonal term in the expansion behind [sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr).)"
  - q: "How many products are summed at lag `s` when `s < n`?"
    type: choice
    choices: ["`n`", "`n - s`", "`s`", "`n - 1`"]
    answer: 1
    explain: "`∑ i ∈ range (n - s), lookupNat a i * lookupNat a (i + s)` — one product per position where the shifted copy still overlaps the original."
  - q: "Compute `aperiodicAutocorr a 1` for `a = +-+`."
    type: number
    answer: -2
    explain: "`a₀a₁ + a₁a₂ = (1)(-1) + (-1)(1) = -2`."
  - q: "Is the shifted copy wrapped around the end of the sequence?"
    type: choice
    choices: ["yes, it wraps (that is what 'aperiodic' means)", "no, it slides off the end — wrapping is [periodicAutocorr](#/node/periodicAutocorr)"]
    answer: 1
    explain: "`aperiodicAutocorr` sums only the genuine overlap. The periodic version `∑ i : Fin n, x i * x (i + s)` uses `Fin` addition, which wraps, and always has `n` terms."
---

## ELI5

Write the row of pluses and minuses twice, one copy under the other, and slide the bottom copy `s`
steps to the right. Wherever the two copies line up, multiply the two symbols (same symbols give
`+1`, different gives `−1`). Add up all those answers. That number is `N_a(s)`. Slide far enough
and nothing lines up, so the answer is 0.

## Plain English

```
def aperiodicAutocorr {n : Nat} (a : Fin n → Int) (s : Nat) : Int :=
  if s ≥ n then 0
  else ∑ i ∈ range (n - s), lookupNat a i * lookupNat a (i + s)
```

Written mathematically, for `s < n`:

`N_a(s) = Σ_{i=0}^{n−1−s} aᵢ · a_{i+s}`

The library's shorthand `N_a(s)` appears throughout the docstrings and in the widgets. Three
things to note about the Lean:

- **It is total.** The guard means `aperiodicAutocorr a s` is a perfectly good integer for any
  `s : Nat`, including huge ones. That is what allows the vanishing condition to be stated as
  `∀ s : Nat, 1 ≤ s → s < n → …` rather than over a `Fin` type, and it makes lemmas like
  `aperiodicAutocorr_zero_of_ge` one-liners.
- **Indices are 0-based**, through [lookupNat](#/node/lookupNat). `aperiodicAutocorr_A_via_xAt`
  in `Turyn/XY.lean` is the bridge to the 1-indexed form used in the papers.
- **It does not wrap.** The Turyn condition is about aperiodic autocorrelations; the
  Goethals–Seidel array needs [periodic](#/node/periodicAutocorr) ones. Turning the first into the
  second is exactly what [step2](#/node/step2) accomplishes, via
  `periodicAutocorr x s = aperiodicAutocorr x s + aperiodicAutocorr x (m - s)`.

The symmetric functions `aperiodicAutocorr_negSeqFn`, `_reverseFn` and `_altSeqFn` record how it
behaves under the elementary moves: negating a sequence leaves it alone, reversing leaves it alone,
alternating multiplies it by `(−1)ˢ`. Those three lemmas are the whole reason
[Elementary](#/node/Elementary) moves preserve the Turyn condition.
