---
id: PmSeq.neg
title: "PmSeq.neg: negation, bundled"
summary: "`s.neg` is the ±1 sequence with every entry negated, packaged with the proof that ±1-ness survives."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A thin wrapper: the carrier is [negSeqFn](#/node/negSeqFn) `s.data` and the proof field is `negSeqFn_AllPmOne s.pm`. The simp lemma `PmSeq.neg_data` lets proofs project straight past the wrapper."
quiz:
  - q: "What is the `data` field of `s.neg`?"
    type: text
    answer: ["negSeqFn s.data", "negSeqFn s.data ", "-(s.data)"]
    explain: "`⟨negSeqFn s.data, negSeqFn_AllPmOne s.pm⟩`, with `PmSeq.neg_data : (s.neg).data = negSeqFn s.data` as a simp lemma."
  - q: "Why is the `pm` field provable?"
    type: choice
    choices: ["because `-1` and `1` swap under negation", "because negation preserves sums", "it is assumed"]
    answer: 0
    explain: "`negSeqFn_AllPmOne`: if `a i = 1` then `-(a i) = -1`, and vice versa."
  - q: "Does negating change any autocorrelation?"
    type: choice
    choices: ["no — `aperiodicAutocorr_negSeqFn`", "yes, it flips every sign", "only at odd lags"]
    answer: 0
    explain: "Each product has two factors from the same sequence, so two sign flips cancel."
---

## Plain English

```
def PmSeq.neg {n : Nat} (s : PmSeq n) : PmSeq n :=
  ⟨negSeqFn s.data, negSeqFn_AllPmOne s.pm⟩
```

[negSeqFn](#/node/negSeqFn) lifted to the bundled [PmSeq](#/node/PmSeq) type. The point of having
it is that the four `negX … negW` [moves](#/node/Elementary) can be written as operations on
records rather than on raw carriers, so the ±1 condition never has to be re-established by hand.
