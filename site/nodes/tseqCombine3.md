---
id: tseqCombine3
title: "tseqCombine3 = a − b + c − d"
summary: "The third of the four ±1 vectors formed from a T-sequence's rows."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "±1 by the same argument as [tseqCombine1](#/node/tseqCombine1)."
quiz:
  - q: "What is the sign pattern?"
    type: choice
    choices: ["`+ + + +`", "`+ + − −`", "`+ − + −`", "`+ − − +`"]
    answer: 2
    explain: "`fun i => T.a.data i - T.b.data i + T.c.data i - T.d.data i`."
  - q: "If `b i = -1` and the others are 0, what is `tseqCombine3 T i`?"
    type: number
    answer: 1
    explain: "`0 - (-1) + 0 - 0 = 1`."
  - q: "Which block of [gsMatrix](#/node/gsMatrix) does this vector seed?"
    type: choice
    choices: ["the diagonal blocks", "the blocks built from `x3`, i.e. `C·R` and `±Cᵗ·R`", "none"]
    answer: 1
    explain: "`gsDataOfTSequence` sets `x3 := tseqCombine3 T`, and `gsC G = circulant G.x3` appears in the array as `C·R` and (transposed, reversed) as `±trCirculant G.x3`."
---

## Plain English

```
def tseqCombine3 {m : Nat} (T : TSequence m) : Fin m → Int :=
  fun i => T.a.data i - T.b.data i + T.c.data i - T.d.data i
```

The `(+,−,+,−)` combination. See [tseqCombine1](#/node/tseqCombine1) and
[tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity).
