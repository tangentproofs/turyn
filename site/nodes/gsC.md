---
id: gsC
title: "gsC: the third circulant block"
summary: "`gsC G = circulant G.x3` — one of the three blocks that enter the array twisted by the reversal matrix."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A one-line abbreviation, following the classical `A, B, C, D` naming for the fields `x1 … x4`."
  - "In the array it never appears bare: it occurs as `gsC G * reversalMatrix n` and, transposed and reversed, as `±trCirculant G.x3`."
quiz:
  - q: "`gsC G` is which matrix?"
    type: text
    answer: ["circulant G.x3", "circulant (G.x3)", "circulant x3", "circulant of x3", "the circulant of G.x3", "Turyn.circulant G.x3"]
    explain: "`def gsC {n : Nat} (G : GSData n) : IntMat n := circulant G.x3`."
  - q: "Does it appear on the diagonal of the array?"
    type: choice
    choices: ["yes", "no — the diagonal is always [gsA](#/node/gsA)"]
    answer: 1
    explain: "All four diagonal blocks of `gsMatrixEntry` are `gsA G`."
  - q: "What twist does it get?"
    type: choice
    choices: ["right multiplication by the [reversal matrix](#/node/reversalMatrix)", "transposition only", "none"]
    answer: 0
    explain: "`gsC G * reversalMatrix n` in the first row/column, and [trCirculant](#/node/trCirculant) `G.x3 = (circulant G.x3)ᵀ * reversalMatrix n` in the inner blocks."
---

## Plain English

```
def gsC {n : Nat} (G : GSData n) : IntMat n := circulant G.x3
```

The [circulant](#/node/circulant) of the third of the four ±1 vectors of a
[GSData](#/node/GSData). Unlike [gsA](#/node/gsA) it always appears twisted in the
[array](#/node/gsMatrix), either as `gsC G * R` or as
[trCirculant](#/node/trCirculant) `G.x3`, which is what breaks the commutativity that
would otherwise stop the off-diagonal blocks from cancelling.
