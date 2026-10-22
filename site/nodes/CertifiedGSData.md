---
id: CertifiedGSData
title: "CertifiedGSData n: four vectors whose autocorrelations cancel"
summary: "A [GSData n](#/node/GSData) extended with a proof that `combinedPeriodic` vanishes at every non-zero shift."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It `extends GSData n`, so its underlying data is reached as `G.toGSData` — which is why the theorem statements read `gsMatrix G.toGSData` and `gsA G.toGSData`."
  - "The shift is quantified as `∀ s : Fin n, s.1 ≠ 0`, so `n ≤ 1` makes the condition vacuous."
quiz:
  - q: "What does the extra field say?"
    type: choice
    choices: ["that the four vectors are orthogonal", "`∀ s : Fin n, s.1 ≠ 0 → combinedPeriodic toGSData s = 0`", "that `n` is a multiple of 4"]
    answer: 1
    explain: "Exactly that: the sum of the four periodic autocorrelations vanishes away from shift 0."
  - q: "How do you get a `CertifiedGSData` in this library?"
    type: choice
    choices: ["from a [TSequence](#/node/TSequence), via [gsDataOfTSequence](#/node/gsDataOfTSequence)", "by `native_decide`", "it is assumed"]
    answer: 0
    explain: "`gsDataOfTSequence T` builds the four combinations and proves the vanishing field from `T.periodic_vanishing` together with [tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity)."
  - q: "What is the headline theorem about it?"
    type: choice
    choices: ["`gsMatrix_isHadamard`", "`gsMatrix_pmOne`", "`four_circulant_products_eq`"]
    answer: 0
    explain: "`theorem gsMatrix_isHadamard {n : Nat} (G : CertifiedGSData n) : IsHadamardMat (gsMatrix G.toGSData)`. The other two are ingredients."
---

## Plain English

```
structure CertifiedGSData (n : Nat) extends GSData n where
  periodic_vanishing : ∀ s : Fin n, s.1 ≠ 0 → combinedPeriodic toGSData s = 0
```

Four ±1 vectors, plus the certificate that makes them usable: at every non-zero shift, their four
[periodic autocorrelations](#/node/periodicAutocorr) add to zero.

This is the precise hypothesis of the Goethals–Seidel construction, and the whole of
`Turyn/GoethalsSeidel.lean` from `four_circulant_products_eq` onwards is the proof that it
suffices:

1. `four_circulant_products_eq` — the four circulants' Gram matrices add to `4n · I`.
2. `gsBlockMatrix_diag_blocks`, `gsBlockMatrix_upper_right_zero`, `gsBlockMatrix_lower_left_zero`
   and the `gsBlock_offdiag_*` lemmas — in the 4 × 4 block picture, the diagonal blocks of
   `H · Hᵀ` are each `4n · I` and everything off the diagonal cancels.
3. `gsMatrix_target`, then `gsMatrix_isHadamard` — reindex from the block type back to
   `Fin (4n)` and conclude.

The one place a `CertifiedGSData` is built is [gsDataOfTSequence](#/node/gsDataOfTSequence).
