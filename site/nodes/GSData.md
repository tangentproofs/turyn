---
id: GSData
title: "GSData n: four ±1 vectors for the array"
summary: "A record of four `IntVec n`s together with proofs that each is entrywise ±1."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "No orthogonality condition. `GSData` is only the input *shape*; the autocorrelation requirement is added by [CertifiedGSData](#/node/CertifiedGSData), which extends it."
  - "`IsPmOneVec x` is `∀ i, x i = 1 ∨ x i = -1` — the [IntVec](#/node/IntVec) analogue of [AllPmOne](#/node/AllPmOne), defined separately in `Turyn/MatUtils.lean`."
quiz:
  - q: "How many fields does `GSData n` have?"
    type: number
    answer: 8
    explain: "`x1, x2, x3, x4` and the four proofs `x1_pm … x4_pm`."
  - q: "Does `GSData` include the vanishing condition?"
    type: choice
    choices: ["yes", "no — that is in [CertifiedGSData](#/node/CertifiedGSData)"]
    answer: 1
    explain: "`structure CertifiedGSData (n : Nat) extends GSData n where periodic_vanishing : …`. Splitting the two means the entrywise-±1 theorem `gsMatrix_pmOne` can be stated for plain `GSData`."
  - q: "What can you prove about [gsMatrix](#/node/gsMatrix) from `GSData` alone?"
    type: choice
    choices: ["that it is Hadamard", "that it is entrywise ±1", "nothing"]
    answer: 1
    explain: "`gsMatrix_pmOne : ∀ i j, gsMatrix G i j = 1 ∨ gsMatrix G i j = -1`. Every block of the array is a circulant, a column-reversed circulant or a `trCirculant`, possibly negated — all of which just move entries of the seeds around."
---

## Plain English

```
structure GSData (n : Nat) where
  x1 x2 x3 x4 : IntVec n
  x1_pm : IsPmOneVec x1
  x2_pm : IsPmOneVec x2
  x3_pm : IsPmOneVec x3
  x4_pm : IsPmOneVec x4
```

The input to the Goethals–Seidel array: four ±1 vectors of the same length. That is enough to
*build* the matrix ([gsMatrix](#/node/gsMatrix)) and to know its entries are ±1
(`gsMatrix_pmOne`), which is the first half of [IsHadamardMat](#/node/IsHadamardMat).

The second half needs more: the four vectors' periodic autocorrelations must cancel at every
non-zero shift. That condition is added by [CertifiedGSData](#/node/CertifiedGSData). Keeping the
two apart is why the library can prove the ±1 half once, for every quadruple of ±1 vectors, and
worry about orthogonality separately.

In the pipeline, the `GSData` is produced by [gsDataOfTSequence](#/node/gsDataOfTSequence) from the
four combinations of a [T-sequence](#/node/TSequence)'s rows.
