---
id: IsPmOneVec
title: "IsPmOneVec: ±1 entries, for vectors"
summary: "`IsPmOneVec x` is `∀ i, x i = 1 ∨ x i = -1` for an [IntVec n](#/node/IntVec) — the matrix side's version of [AllPmOne](#/node/AllPmOne)."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Identical in content to [AllPmOne](#/node/AllPmOne); it exists because the matrix half of the library was written against `IntVec` rather than `Fin n → Int`, and `IntVec` is an `abbrev` for the same thing. The two predicates are definitionally equal."
quiz:
  - q: "What does it say?"
    type: choice
    choices: ["`∀ i, x i = 1 ∨ x i = -1`", "`∀ i, x i ≠ 0`", "`∀ i, x i = 1`"]
    answer: 0
    explain: "The same as [AllPmOne](#/node/AllPmOne), stated for `IntVec n`."
  - q: "Which structures carry it as a field?"
    type: choice
    choices: ["[PmSeq](#/node/PmSeq)", "[GSData](#/node/GSData), four times", "[TSequence](#/node/TSequence)"]
    answer: 1
    explain: "`x1_pm : IsPmOneVec x1` and so on. `PmSeq` carries [AllPmOne](#/node/AllPmOne), and `TSequence` carries [AllSignOne](#/node/AllSignOne)."
  - q: "Where is it established in the pipeline?"
    type: choice
    choices: ["by `native_decide`", "by `tseqCombine1_pmOne … tseqCombine4_pmOne`, from a T-sequence's `support` field", "it is assumed"]
    answer: 1
    explain: "The four combinations of a T-sequence's rows are ±1 because exactly one row is non-zero at each position."
---

## Plain English

```
def IsPmOneVec {n : Nat} (x : IntVec n) : Prop :=
  ∀ i, x i = 1 ∨ x i = -1
```

The same condition as [AllPmOne](#/node/AllPmOne), written for the matrix side's
[IntVec](#/node/IntVec) carrier. Since `IntVec n` is an `abbrev` for `Fin n → Int`, the two are
the same proposition; the duplication is a naming convenience, not a distinction.

It is the ±1 hypothesis that [GSData](#/node/GSData) carries four times over, and what makes
`circulant_pmOne`, `mul_reversalMatrix_pmOne` and `trCirculant_pmOne` — hence
`gsMatrix_pmOne`, the first half of [IsHadamardMat](#/node/IsHadamardMat) — go through.
