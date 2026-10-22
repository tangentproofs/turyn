---
id: TSequence
title: "TSequence m: four rows that tile and cancel"
summary: "Four `{0, ±1}` rows of length `m` such that exactly one is non-zero at each position, and their periodic autocorrelations sum to zero at every non-zero shift."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The `support` field is stated as `natAbs a + natAbs b + natAbs c + natAbs d = 1` for each position — a numeric way of saying 'exactly one of the four is non-zero here'. It implies all four entries are in `{0, ±1}`, so it partly duplicates the `SignSeq` conditions."
  - "The `periodic_vanishing` field quantifies over `s : Fin m` with `s.1 ≠ 0`. There are `m − 1` such shifts (none at all when `m ≤ 1`)."
  - "`TSequence m` is defined for any `m`, with no relation to a Turyn-type length. [step2](#/node/step2) produces the case `m = 3n − 1`, and [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) holds for every `TSequence m`."
widgets:
  - type: tseq
    title: "The four rows, their supports, and the periodic lag table"
    config: { preset: tt6 }
quiz:
  - q: "How many fields does the structure have?"
    type: number
    answer: 6
    explain: "`a`, `b`, `c`, `d`, `support`, `periodic_vanishing`."
  - q: "What does `support` say at a given position?"
    type: choice
    choices: ["all four entries are ±1", "the four entries sum to 1", "exactly one of the four entries is non-zero (and it is ±1)", "at least one is non-zero"]
    answer: 2
    explain: "`(a i).natAbs + (b i).natAbs + (c i).natAbs + (d i).natAbs = 1`: four non-negative integers from `{0, 1}` adding to 1."
  - q: "How many shifts does `periodic_vanishing` cover when `m = 17`?"
    type: number
    answer: 16
    explain: "Every `s : Fin 17` with `s.1 ≠ 0`, i.e. `s = 1, …, 16`."
  - q: "Are the rows ±1 sequences?"
    type: choice
    choices: ["yes", "no — they are [SignSeq](#/node/SignSeq)s, and three of the four are zero at each position"]
    answer: 1
    explain: "Zeros are unavoidable given `support`. The ±1 property returns after the four rows are added and subtracted."
---

## Plain English

```
structure TSequence (m : Nat) where
  a b c d : SignSeq m
  support : ∀ i : Fin m, (a.data i).natAbs + (b.data i).natAbs
                       + (c.data i).natAbs + (d.data i).natAbs = 1
  periodic_vanishing : ∀ s : Fin m, s.1 ≠ 0 →
    periodicAutocorr a.data s + periodicAutocorr b.data s
      + periodicAutocorr c.data s + periodicAutocorr d.data s = 0
```

The intermediate object of the construction. Two conditions:

1. **Tiling.** At each of the `m` positions, exactly one of the four rows carries a `±1` and the
   other three carry `0`. (Classically: the four rows have disjoint supports whose union is
   everything.)
2. **Cancellation.** For every non-zero shift, the four *periodic* autocorrelations add to zero.

These two together are exactly what the Goethals–Seidel array needs. Tiling makes the four
combinations `a±b±c±d` entrywise ±1; cancellation makes their circulants orthogonal, because
`tseqCombine_periodic_identity` says the four combined periodic autocorrelations are `4 ×` the
original four, hence also zero.

[step2](#/node/step2) is the one place a `TSequence` gets built — from a TT(n), at length
`m = 3n − 1` — and [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) is the one place one
gets consumed. Everything in between is independent of where the T-sequence came from, which is why
the Hadamard theorem is stated for an arbitrary `TSequence m`.
