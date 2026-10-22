---
id: tseqCombine4
title: "tseqCombine4 = a − b − c + d"
summary: "The fourth of the four ±1 vectors formed from a T-sequence's rows."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "±1 by the same argument as [tseqCombine1](#/node/tseqCombine1)."
quiz:
  - q: "What is the sign pattern?"
    type: choice
    choices: ["`+ + + +`", "`+ + − −`", "`+ − + −`", "`+ − − +`"]
    answer: 3
    explain: "`fun i => T.a.data i - T.b.data i - T.c.data i + T.d.data i`."
  - q: "If `d i = 1` and the others are 0, what is `tseqCombine4 T i`?"
    type: number
    answer: 1
    explain: "`0 - 0 - 0 + 1 = 1`."
  - q: "How many of the four combinations are needed for the array?"
    type: number
    answer: 4
    explain: "[gsDataOfTSequence](#/node/gsDataOfTSequence) uses all four as `x1 … x4`, one per circulant block family."
---

## Plain English

```
def tseqCombine4 {m : Nat} (T : TSequence m) : Fin m → Int :=
  fun i => T.a.data i - T.b.data i - T.c.data i + T.d.data i
```

The `(+,−,−,+)` combination, completing the set. See
[tseqCombine1](#/node/tseqCombine1) and
[tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity).
