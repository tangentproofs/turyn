---
id: typedGsMatrix_isHadamard
title: "Every T-sequence yields a Hadamard matrix"
summary: "For any [TSequence m](#/node/TSequence), the Goethals–Seidel matrix built from it is Hadamard of order `4m`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "No hypothesis beyond having a `TSequence m`. In particular `m` need not be `3n − 1`, and nothing about Turyn-type sequences appears — this is the general Goethals–Seidel theorem, as formalized here."
  - "At `m = 0` it is the vacuous statement about the 0 × 0 matrix."
  - "`#print axioms` reports only `propext`, `Classical.choice`, `Quot.sound`: the proof is matrix algebra, with no computation."
widgets:
  - type: gs-array
    title: "The array and the product H · Hᵗ"
    config: { preset: tt6 }
  - type: outline
    title: "The proof, in the block picture"
    config:
      steps:
        - text: "Four combinations of the T-sequence's rows: ±1 vectors whose periodic autocorrelations still cancel"
          link: "gsDataOfTSequence"
        - text: "Their four circulants satisfy A·Aᵗ + B·Bᵗ + C·Cᵗ + D·Dᵗ = 4m · I"
          note: "four_circulant_products_eq: off the diagonal this is combinedPeriodic at a non-zero shift; on the diagonal each term is m."
          link: "combinedPeriodic"
        - text: "Rewrite the array as a genuine 4 × 4 block matrix over (Fin m ⊕ Fin m) ⊕ (Fin m ⊕ Fin m)"
          link: "gsMatrix"
        - text: "Each diagonal block of H · Hᵗ is 4m · I; each off-diagonal block cancels, using the reversal-matrix commutation lemmas"
          link: "reversalMatrix"
          hard: true
        - text: "Transport back along gsBlockEquiv and conclude IsHadamardMat"
          link: "IsHadamardMat"
quiz:
  - q: "What hypothesis does the theorem need?"
    type: choice
    choices: ["that the T-sequence came from a TT(n)", "only that it is a [TSequence m](#/node/TSequence)", "that `m` is odd", "that `4m` is a multiple of 8"]
    answer: 1
    explain: "`theorem typedGsMatrix_isHadamard {m : Nat} (T : TSequence m) : IsHadamardMat (typedGsMatrixOfTSequence T)`. The two structure fields of `TSequence` are all it uses."
  - q: "Which part of the proof uses the `support` field of the T-sequence?"
    type: choice
    choices: ["the orthogonality", "the entrywise ±1 condition", "neither"]
    answer: 1
    explain: "`support` makes the four combinations ±1, hence every block of the array ±1 (`gsMatrix_pmOne`). Orthogonality comes from `periodic_vanishing`."
  - q: "Where does the factor 4 in `4m · I` come from?"
    type: choice
    choices: ["the four blocks on each diagonal of the array contributing `A·Aᵗ + B·Bᵗ + C·Cᵗ + D·Dᵗ`", "the four sign patterns", "the four Turyn sequences"]
    answer: 0
    explain: "Each diagonal block of `H · Hᵗ` is the sum of four Gram matrices, each contributing `m` on its own diagonal."
  - q: "Does the proof involve any computation (`decide` or `native_decide`)?"
    type: choice
    choices: ["yes", "no — it is matrix algebra, valid for every `m`"]
    answer: 1
    explain: "This is why its axiom list is the standard three. The only computation anywhere in the chain is checking that a *particular* quadruple is Turyn-type."
---

## Plain English

```
theorem typedGsMatrix_isHadamard {m : Nat} (T : TSequence m) :
    IsHadamardMat (typedGsMatrixOfTSequence T)
```

The general theorem of the matrix half: *any* T-sequence of length `m` produces a Hadamard matrix
of order `4m`. Nothing about Turyn-type sequences is involved — they only enter via
[step2](#/node/step2), which is how a T-sequence gets built in the first place.

The proof occupies most of `Turyn/GoethalsSeidel.lean`, and the shape is:

1. **±1 entries.** Each block of the array is a circulant, a column-reversed circulant or a
   [trCirculant](#/node/trCirculant), possibly negated; all of those just move entries of the four
   seeds around, and the seeds are ±1 by the T-sequence's `support` field.
   (`gsMatrix_pmOne`, `gsBlockMatrix_pmOne`.)
2. **The four Gram matrices.** `A·Aᵀ + B·Bᵀ + C·Cᵀ + D·Dᵀ = 4m · I`. Entry `(i, j)` of a
   circulant's Gram matrix is its seed's periodic autocorrelation at `i − j`, so off the diagonal
   the four add up to [combinedPeriodic](#/node/combinedPeriodic) at a non-zero shift, which is 0;
   on the diagonal each contributes `m`. (`four_circulant_products_eq`.)
3. **Block algebra.** Viewing the array as a 4 × 4 block matrix (Mathlib's `fromBlocks`, twice
   nested), compute `H · Hᵀ` blockwise. The diagonal blocks are each the sum in step 2; the
   off-diagonal blocks are differences of equal terms, by the commutation identities for
   circulants and the [reversal matrix](#/node/reversalMatrix). (`gsBlockMatrix_diag_blocks`,
   `gsBlockMatrix_upper_right_zero`, `gsBlockMatrix_lower_left_zero`, `gsBlock_offdiag_*`.)
4. **Transport.** `gsBlockEquiv` identifies the block index type with `Fin (4m)` and
   `gsMatrix_eq_reindex_gsBlockMatrix` moves the result back, giving `gsMatrix_target` and then
   `gsMatrix_isHadamard`.

Everything there is uniform in `m`: no case analysis on numbers, no computation. That is why this
theorem — and the two above it, [turynToHadamardMatrix_isHadamard](#/node/turynToHadamardMatrix_isHadamard)
and [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) — rest on only Lean's three
standard axioms.
