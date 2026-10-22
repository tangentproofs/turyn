---
id: trCirculant
title: "trCirculant: a transposed circulant, column-reversed"
summary: "`trCirculant x = (circulant x)ᵀ * reversalMatrix n` — the block shape the Goethals–Seidel array uses off the diagonal."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Its entries are `x (i - revFin j)`, so it is still entrywise ±1 when `x` is (`trCirculant_pmOne`), but it is not a circulant."
  - "The docstring calls it the block 'corresponding to `Aᵀ R = R A`'. That is the identity it is there to exploit; it is not an equation this definition itself states."
quiz:
  - q: "`trCirculant x` is defined as what?"
    type: choice
    choices: ["`circulant x * reversalMatrix n`", "`(circulant x)ᵀ * reversalMatrix n`", "`reversalMatrix n * circulant x`"]
    answer: 1
    explain: "`def trCirculant {n : Nat} (x : IntVec n) : IntMat n := (circulant x)ᵀ * reversalMatrix n`."
  - q: "What is its `(i, j)` entry?"
    type: choice
    choices: ["`x (j - i)`", "`x (i - revFin j)`", "`x (revFin i - j)`"]
    answer: 1
    explain: "`mul_reversalMatrix_apply` then `circulant_transpose_apply`: `(circulant x)ᵀ i (revFin j) = x (i - revFin j)`. That is the computation inside `trCirculant_pmOne`."
  - q: "If `x` is entrywise ±1, is `trCirculant x`?"
    type: choice
    choices: ["yes (`trCirculant_pmOne`)", "no, the reversal introduces zeros"]
    answer: 0
    explain: "Multiplying by the permutation matrix `R` just permutes entries; it does not mix them. Each entry of the product is a single entry of `x`."
  - q: "Which blocks of the array use it?"
    type: choice
    choices: ["the four diagonal blocks", "the off-diagonal blocks outside the first block row and column — built from `x2`, `x3` and `x4`", "none"]
    answer: 1
    explain: "In `gsMatrixEntry` the six blocks `trCirculant G.x4`, `-(trCirculant G.x3)`, `-(trCirculant G.x4)`, `trCirculant G.x2`, `trCirculant G.x3`, `-(trCirculant G.x2)` sit at block positions (1,2), (1,3), (2,1), (2,3), (3,1), (3,2) — so `x2`, `x3` and `x4` all appear this way. The diagonal is always `gsA G = circulant G.x1`, and the first block row and column use `gs* G * reversalMatrix n` instead."
---

## Plain English

```
def trCirculant {n : Nat} (x : IntVec n) : IntMat n :=
  (circulant x)ᵀ * reversalMatrix n
```

One of the three block shapes in the Goethals–Seidel array. Written out, entry `(i, j)` is
`x (i − revFin j)` where `revFin j = n − 1 − j`.

Its purpose is to break commutativity in a controlled way. Circulants of the same size commute
with each other, which is normally useful and here would be fatal: in the product `H · Hᵀ` the
off-diagonal contributions would reinforce instead of cancelling. Conjugating by the
[reversal matrix](#/node/reversalMatrix) produces blocks that satisfy
`Aᵀ R = R A`-style identities instead, and the array's sign pattern then makes each off-diagonal
block of `H · Hᵀ` a difference of two equal terms. `Turyn/GoethalsSeidel.lean` proves those
cancellations block by block (`gsBlockMatrix_upper_right_zero`,
`gsBlockMatrix_lower_left_zero`, and the four `gsBlock_offdiag_*` lemmas).
