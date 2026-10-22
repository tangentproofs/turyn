---
id: SignSeq
title: "SignSeq n: a {0, ±1} sequence of length n"
summary: "Like [PmSeq](#/node/PmSeq), but entries may also be `0`: a function `Fin n → Int` paired with a proof of [AllSignOne](#/node/AllSignOne)."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It permits zeros; it does not require any. Every `PmSeq n` lifts to a `SignSeq n` via `PmSeq.toSign`."
  - "Only used for the four components of a [TSequence](#/node/TSequence), where the zeros are the point: the four rows have disjoint supports."
quiz:
  - q: "Which values may an entry take?"
    type: choice
    choices: ["`1` or `-1`", "`0`, `1` or `-1`", "any integer"]
    answer: 1
    explain: "The `sign` field is [AllSignOne](#/node/AllSignOne) `data`, i.e. `∀ i, data i = 0 ∨ data i = 1 ∨ data i = -1`."
  - q: "Where is `SignSeq` used?"
    type: choice
    choices: ["for the four sequences of a TT(n)", "for the four rows of a T-sequence", "for the rows of the Hadamard matrix"]
    answer: 1
    explain: "`structure TSequence (m : Nat) where a b c d : SignSeq m …`. The TT(n) sequences are `PmSeq`s; the Hadamard matrix rows are ±1 again after [the four combinations](#/node/tseqCombine_periodic_identity)."
  - q: "How many fields does `SignSeq n` have?"
    type: number
    answer: 2
    explain: "`data : Fin n → Int` and `sign : AllSignOne data`."
---

## Plain English

```
structure SignSeq (n : Nat) where
  data : Fin n → Int
  sign : AllSignOne data
```

The `{0, ±1}` sibling of [PmSeq](#/node/PmSeq). Zeros appear in the middle of the Hadamard
construction, and only there.

A [T-sequence](#/node/TSequence) of length `m` is four rows of length `m` whose **supports are
disjoint and cover everything**: at each of the `m` positions, exactly one of the four rows is
non-zero and the other three are `0`. Stated in the Lean as

```
support : ∀ i : Fin m, (a.data i).natAbs + (b.data i).natAbs + (c.data i).natAbs + (d.data i).natAbs = 1
```

which is a neat way to say "exactly one of them is ±1 here". That is impossible for four ±1
sequences, hence `SignSeq`.

The zeros disappear one step later. Adding and subtracting the four rows in the four sign patterns
`(+,+,+,+)`, `(+,+,−,−)`, `(+,−,+,−)`, `(+,−,−,+)` gives four sequences that are ±1 again, because
at each position only one summand is non-zero and it contributes `±1`. The helper lemma is
`natAbs_four_sum_eq_one_pmOne`, proved by `omega` after a case split on the three signs.

There is a `SignSeq.ofList` constructor mirroring [PmSeq.ofList](#/node/PmSeq.ofList), but nothing
in the pipeline uses it: [step2](#/node/step2) builds its components as functions directly.
