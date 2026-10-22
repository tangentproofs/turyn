---
id: IsHadamardMat
title: "IsHadamardMat: ±1 entries and orthogonal rows"
summary: "`IsHadamardMat H` is the conjunction of 'every entry is `1` or `-1`' and `H · Hᵀ = n · I`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is the matrix-level definition and nothing more. It says nothing about `n` being 1, 2 or a multiple of 4; those are theorems about Hadamard matrices that this library does not prove."
  - "At `n = 0` it holds trivially for the unique 0 × 0 matrix: the `∀ i j` is vacuous and both sides of the product equation are the empty matrix. That is the degenerate output of [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) at `n = 0`."
  - "The equation is `H * Hᵀ = (n : Int) • (1 : IntMat n)`, a scalar multiple of the identity in Mathlib's sense. It implies `Hᵀ * H = n · I` too (over a commutative ring, for a square matrix), but the library does not state that direction."
widgets:
  - type: hadamard
    title: "Both halves of the definition, checked on a real matrix"
    config: { source: tt6 }
quiz:
  - q: "How many conjuncts does the definition have?"
    type: number
    answer: 2
    explain: "`(∀ i j, H i j = 1 ∨ H i j = -1) ∧ H * Hᵀ = (n : Int) • (1 : IntMat n)`."
  - q: "What does the second conjunct say about two *distinct* rows of `H`?"
    type: choice
    choices: ["their dot product is `n`", "their dot product is 0", "they are equal", "nothing"]
    answer: 1
    explain: "Entry `(i, j)` of `H * Hᵀ` is the dot product of rows `i` and `j`. Off the diagonal the right-hand side is 0, so distinct rows are orthogonal; on the diagonal it is `n`, which is automatic from ±1 entries."
  - q: "Does `IsHadamardMat` require `n` to be a multiple of 4?"
    type: choice
    choices: ["yes", "no — it is a definition, with no divisibility condition"]
    answer: 1
    explain: "No arithmetic condition on `n` appears. (That orders above 2 must be divisible by 4 is a classical theorem, and it is not proved here.)"
  - q: "Is `IsHadamardMat` true of the unique 0 × 0 matrix?"
    type: choice
    choices: ["yes, vacuously", "no", "it does not type-check"]
    answer: 0
    explain: "`∀ i j` over `Fin 0` is vacuous, and both sides of the equation are the unique 0 × 0 matrix. It is worth knowing because `4 * (3 * n - 1)` is `0` at `n = 0`."
  - q: "For [tt6_hadamard](#/node/tt6_hadamard), what is the diagonal of `H * Hᵀ`?"
    type: number
    answer: 68
    explain: "Each row dotted with itself is the sum of 68 squares of ±1, so 68 — which is `n` for this matrix."
---

## Plain English

```
def IsHadamardMat {n : Nat} (H : IntMat n) : Prop :=
  (∀ i j, H i j = 1 ∨ H i j = -1) ∧
  H * Hᵀ = (n : Int) • (1 : IntMat n)
```

Two requirements:

1. **Entries.** Each `H i j` is `1` or `-1`. Nothing else is allowed — no zeros.
2. **Orthogonality.** `H · Hᵀ = n · I`. Entry `(i, j)` of `H · Hᵀ` is row `i` dotted with row `j`,
   so this says: each row dotted with itself gives `n` (which is forced by requirement 1, since
   there are `n` entries each squaring to 1), and any two different rows dot to `0`.

That is the whole definition, and it is the goal of the construction: given a Turyn-type
quadruple, [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) produces an `H` with
both properties at order `4(3n − 1)`.

## How the proof gets there

The second conjunct is the hard half. In `Turyn/GoethalsSeidel.lean` it is reorganized as
`GSTarget G : gsMatrix G * (gsMatrix G)ᵀ = (4 * n : Int) • 1`, proved by viewing the matrix as a
genuine 4 × 4 block matrix (`gsBlockMatrix`, using Mathlib's `fromBlocks`), computing each block
of the product with circulant identities, and showing the off-diagonal blocks cancel while the
diagonal blocks add up to `4n · I`. The one place the autocorrelation hypothesis enters is
`four_circulant_products_eq`, which turns [CertifiedGSData](#/node/CertifiedGSData)'s vanishing
*periodic* autocorrelations into `A·Aᵀ + B·Bᵀ + C·Cᵀ + D·Dᵀ = 4n · I`. The Turyn condition itself
is used earlier and elsewhere, in [step2_periodic](#/node/step2_periodic).
