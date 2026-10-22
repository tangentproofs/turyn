---
id: combinedPeriodic
title: "combinedPeriodic: the four periodic autocorrelations, added"
summary: "`combinedPeriodic G s` is the unweighted sum of the four periodic autocorrelations of a [GSData](#/node/GSData) at shift `s`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**Unweighted**, unlike [combinedAutocorr](#/node/combinedAutocorr), whose weights are 1, 1, 2, 2. By the time the construction reaches the matrix side, the four vectors play symmetric roles, so no weighting is needed."
  - "Periodic, not aperiodic: the shift is a `Fin n` and the products wrap around."
quiz:
  - q: "What weights does `combinedPeriodic` use?"
    type: choice
    choices: ["1, 1, 2, 2", "1, 1, 1, 1", "2, 2, 1, 1"]
    answer: 1
    explain: "`periodicAutocorr G.x1 s + periodicAutocorr G.x2 s + periodicAutocorr G.x3 s + periodicAutocorr G.x4 s` — a plain sum."
  - q: "Why are no weights needed here, when [combinedAutocorr](#/node/combinedAutocorr) has them?"
    type: choice
    choices: ["an inconsistency in the library", "because the four GS vectors are symmetric: each becomes one circulant block of the same kind", "because periodic autocorrelations are always zero"]
    answer: 1
    explain: "The 1, 1, 2, 2 weights of the Turyn condition are an artefact of how Z and W get duplicated and X, Y get halved on the way to a T-sequence. After that, the four combined vectors enter the array on an equal footing."
  - q: "What does `combinedPeriodic G s = 0` for all `s ≠ 0` give you?"
    type: choice
    choices: ["`A·Aᵀ + B·Bᵀ + C·Cᵀ + D·Dᵀ = 4n · I`", "`A·Aᵀ = n · I`", "that the matrix is symmetric"]
    answer: 0
    explain: "`four_circulant_products_eq`: off the diagonal the four entries add up to `combinedPeriodic G (i - j) = 0`; on the diagonal each contributes `n` (`periodicAutocorr_zero_pmOne`)."
---

## Plain English

```
def combinedPeriodic {n : Nat} (G : GSData n) (s : Fin n) : Int :=
  periodicAutocorr G.x1 s + periodicAutocorr G.x2 s +
    periodicAutocorr G.x3 s + periodicAutocorr G.x4 s
```

The matrix side's version of "the autocorrelations cancel". Two differences from the sequence
side's [combinedAutocorr](#/node/combinedAutocorr):

- the autocorrelations are [periodic](#/node/periodicAutocorr), so the shift wraps;
- the four terms are **unweighted**.

The weights of the Turyn condition were a consequence of its asymmetric roles — Z and W end up
appearing twice over in the base sequences, X and Y get halved. Once
[gsDataOfTSequence](#/node/gsDataOfTSequence) has formed the four combinations, that asymmetry is
gone, and the condition the array needs is the plain sum.

Why it is the right condition: entry `(i, j)` of a circulant's Gram matrix is the periodic
autocorrelation of its seed at `i − j`, so adding the four Gram matrices and asking the result to
be `4n · I` is exactly asking `combinedPeriodic G s = 0` for `s ≠ 0`
(`four_circulant_products_eq`).
