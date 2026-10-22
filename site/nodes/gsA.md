---
id: gsA
title: "gsA: the first circulant block"
summary: "`gsA G = circulant G.x1` — the block that sits on all four diagonal positions of the Goethals–Seidel array."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A one-line abbreviation. The naming follows the classical `A, B, C, D` of the Goethals–Seidel paper, while the fields are `x1 … x4`."
quiz:
  - q: "`gsA G` is which matrix?"
    type: text
    answer: ["circulant G.x1", "circulant (G.x1)", "circulant x1", "circulant of x1", "the circulant of G.x1", "Turyn.circulant G.x1"]
    explain: "`def gsA {n : Nat} (G : GSData n) : IntMat n := circulant G.x1`."
  - q: "How many times does it appear in the 4 × 4 array?"
    type: number
    answer: 4
    explain: "Once on each diagonal block: the cases `0,0`, `1,1`, `2,2`, `3,3` of `gsMatrixEntry` all return `gsA G`."
  - q: "Does it appear reversed anywhere?"
    type: choice
    choices: ["yes, as `gsA G * reversalMatrix n`", "no — only `gsB`, `gsC`, `gsD` get the reversal twist"]
    answer: 1
    explain: "The array's diagonal is the untwisted circulant; the twist is what makes the off-diagonal blocks cancel."
---

## Plain English

```
def gsA {n : Nat} (G : GSData n) : IntMat n := circulant G.x1
```

The [circulant](#/node/circulant) of the first of the four ±1 vectors. In the
[Goethals–Seidel array](#/node/gsMatrix) it is the only block that appears untwisted, and it
appears on all four diagonal positions. Its siblings are [gsB](#/node/gsB),
[gsC](#/node/gsC) and [gsD](#/node/gsD).
