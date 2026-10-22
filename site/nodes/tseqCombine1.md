---
id: tseqCombine1
title: "tseqCombine1 = a + b + c + d"
summary: "The first of the four ±1 vectors formed from a T-sequence's rows, with all signs positive."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The result is ±1 even though the inputs are `{0, ±1}`, because a [TSequence](#/node/TSequence)'s `support` field makes exactly one of the four non-zero at each position. The proof is `tseqCombine1_pmOne`, via `natAbs_four_sum_eq_one_pmOne` (an `omega` after a case split on the signs)."
  - "It is a plain `Fin m → Int`, not a bundled `PmSeq`; the ±1-ness travels separately, as `IsPmOneVec`."
quiz:
  - q: "What is the sign pattern?"
    type: choice
    choices: ["`+ + + +`", "`+ + − −`", "`+ − + −`", "`+ − − +`"]
    answer: 0
    explain: "`fun i => T.a.data i + T.b.data i + T.c.data i + T.d.data i`. The other three patterns are [tseqCombine2](#/node/tseqCombine2), [tseqCombine3](#/node/tseqCombine3), [tseqCombine4](#/node/tseqCombine4)."
  - q: "Why is each entry ±1 and not, say, 2 or 0?"
    type: choice
    choices: ["because the inputs are ±1", "because only one of the four inputs is non-zero at any position, and it is ±1", "by assumption"]
    answer: 1
    explain: "`T.support i` says the four `natAbs` values add to 1."
  - q: "If `a i = -1` and `b i = c i = d i = 0`, what is `tseqCombine1 T i`?"
    type: number
    answer: -1
    explain: "`-1 + 0 + 0 + 0`."
---

## Plain English

```
def tseqCombine1 {m : Nat} (T : TSequence m) : Fin m → Int :=
  fun i => T.a.data i + T.b.data i + T.c.data i + T.d.data i
```

The four rows of a [T-sequence](#/node/TSequence) have disjoint supports, so adding them simply
collects the non-zero entries into one ±1 vector of length `m`.

Taking all four sign patterns `(+,+,+,+)`, `(+,+,−,−)`, `(+,−,+,−)`, `(+,−,−,+)` gives four
different ±1 vectors — and the crucial point is that *their* periodic autocorrelations are
`4 ×` the original combined ones ([tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity)),
so they inherit the cancellation. This is the standard orthogonal-design trick: the four sign
patterns are the rows of a 4 × 4 Hadamard matrix.
