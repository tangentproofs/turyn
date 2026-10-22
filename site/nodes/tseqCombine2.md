---
id: tseqCombine2
title: "tseqCombine2 = a + b − c − d"
summary: "The second of the four ±1 vectors formed from a T-sequence's rows."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "±1 by the same argument as [tseqCombine1](#/node/tseqCombine1): only one of the four rows is non-zero at each position, and the sign pattern just chooses whether to keep or flip it."
quiz:
  - q: "What is the sign pattern?"
    type: choice
    choices: ["`+ + + +`", "`+ + − −`", "`+ − + −`", "`+ − − +`"]
    answer: 1
    explain: "`fun i => T.a.data i + T.b.data i - T.c.data i - T.d.data i`."
  - q: "If `c i = 1` and the others are 0, what is `tseqCombine2 T i`?"
    type: number
    answer: -1
    explain: "`0 + 0 - 1 - 0 = -1`."
  - q: "Taken together, the four sign patterns are the rows of what?"
    type: choice
    choices: ["a 4 × 4 Hadamard matrix", "the identity", "a circulant"]
    answer: 0
    explain: "`(+,+,+,+)`, `(+,+,−,−)`, `(+,−,+,−)`, `(+,−,−,+)` are mutually orthogonal, which is exactly why `tseqCombine_summand_identity` gives a factor of 4 with no cross terms."
---

## Plain English

```
def tseqCombine2 {m : Nat} (T : TSequence m) : Fin m → Int :=
  fun i => T.a.data i + T.b.data i - T.c.data i - T.d.data i
```

The `(+,+,−,−)` combination. See [tseqCombine1](#/node/tseqCombine1) for why the result is
entrywise ±1 and [tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity) for what the
four combinations do together.
