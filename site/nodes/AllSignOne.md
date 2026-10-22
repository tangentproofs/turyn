---
id: AllSignOne
title: "AllSignOne: every entry is 0, +1 or −1"
summary: "`AllSignOne a` is `∀ i : Fin n, a i = 0 ∨ a i = 1 ∨ a i = -1` — the condition carried by [SignSeq](#/node/SignSeq)."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A `Prop`, like [AllPmOne](#/node/AllPmOne); the `Bool` mirror `allSignOne` works on lists."
  - "It allows zeros but does not require any. Every [AllPmOne](#/node/AllPmOne) sequence also satisfies `AllSignOne` — that lift is `PmSeq.toSign`."
quiz:
  - q: "Which values are allowed?"
    type: choice
    choices: ["`0`, `1`, `-1`", "`1`, `-1`", "any integer of absolute value at most 2", "`0` only"]
    answer: 0
    explain: "`∀ i : Fin n, a i = 0 ∨ a i = 1 ∨ a i = -1`."
  - q: "Does `AllPmOne a` imply `AllSignOne a`?"
    type: choice
    choices: ["yes", "no", "only for even `n`"]
    answer: 0
    explain: "Each disjunct of `AllPmOne` is a disjunct of `AllSignOne`. `PmSeq.toSign` is that one-line lift: `sign := fun i => Or.inr (s.pm i)`."
  - q: "Where in the pipeline do zeros actually appear?"
    type: choice
    choices: ["in the Turyn-type quadruple", "in the T-sequence built by [step2](#/node/step2)", "in the Hadamard matrix", "nowhere"]
    answer: 1
    explain: "A T-sequence spreads four sequences over `3n − 1` positions so that exactly one of the four is non-zero at each position; the other three are 0 there. That is why [TSequence](#/node/TSequence) is built from `SignSeq`, not `PmSeq`."
---

## Plain English

Same idea as [AllPmOne](#/node/AllPmOne), with zero allowed:

```
def AllSignOne {n : Nat} (a : Fin n → Int) : Prop :=
  ∀ i : Fin n, a i = 0 ∨ a i = 1 ∨ a i = -1
```

Zeros matter in the middle of the construction. A [T-sequence](#/node/TSequence) is four rows of
some common length whose supports tile the positions: at each position exactly one row is
non-zero. (In this library the length is always `3n − 1`, from [step2](#/node/step2).)
That is impossible with ±1 entries, so those rows are [SignSeq](#/node/SignSeq)s, carrying
`AllSignOne`. The ±1-ness comes back one step later, when the four rows are added and subtracted
([tseqCombine1](#/node/tseqCombine1) and its three siblings): a sum `±a ±b ±c ±d` of four
numbers whose absolute values add to 1 is itself `±1`.
