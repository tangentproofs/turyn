---
id: gsB
title: "gsB: the second circulant block"
summary: "`gsB G = circulant G.x2` — one of the three blocks that enter the array twisted by the reversal matrix."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A one-line abbreviation, following the classical `A, B, C, D` naming for the fields `x1 … x4`."
  - "In the array it never appears bare: it occurs as `gsB G * reversalMatrix n` and, transposed and reversed, as `±trCirculant G.x2`."
quiz:
  - q: "`gsB G` is which matrix?"
    type: text
    answer: ["circulant G.x2", "circulant of x2"]
    explain: "`def gsB {n : Nat} (G : GSData n) : IntMat n := circulant G.x2`."
  - q: "Does it appear on the diagonal of the array?"
    type: choice
    choices: ["yes", "no — the diagonal is always [gsA](#/node/gsA)"]
    answer: 1
    explain: "All four diagonal blocks of `gsMatrixEntry` are `gsA G`."
  - q: "What twist does it get?"
    type: choice
    choices: ["right multiplication by the [reversal matrix](#/node/reversalMatrix)", "transposition only", "none"]
    answer: 0
    explain: "`gsB G * reversalMatrix n` in the first row/column, and [trCirculant](#/node/trCirculant) `G.x2 = (circulant G.x2)ᵀ * reversalMatrix n` in the inner blocks."
---

## Plain English

```
def gsB {n : Nat} (G : GSData n) : IntMat n := circulant G.x2
```

The [circulant](#/node/circulant) of the second of the four ±1 vectors of a
[GSData](#/node/GSData). Unlike [gsA](#/node/gsA) it always appears twisted in the
[array](#/node/gsMatrix), either as `gsB G * R` or as
[trCirculant](#/node/trCirculant) `G.x2`, which is what breaks the commutativity that
would otherwise stop the off-diagonal blocks from cancelling.
