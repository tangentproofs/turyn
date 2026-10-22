---
id: BaseSeqData
title: "BaseSeqData n: base sequences (a side road)"
summary: "Four ±1 sequences of lengths `2n − 1, 2n − 1, n, n` whose four aperiodic autocorrelations *sum to zero* — with equal weights — at every lag `s ≥ 1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**Not on the path to the Hadamard theorem.** [step1](#/node/step1) builds a `BaseSeqData n` from a TT(n) and proves the vanishing field, but no headline theorem uses it: the declaration graph gives both `step1` and `BaseSeqData` a `depth` of `null`, meaning they are not reachable from the headline results. `lean/README.md` describes the pipeline as base sequences → T-sequence → Goethals–Seidel; the Lean's [turynToHadamardMatrix](#/node/turynToHadamardMatrix) skips the first stage."
  - "The vanishing field has no upper bound on `s`: `∀ s : Nat, 1 ≤ s → …`. That is fine, because all four terms are `0` once `s` passes the longest length (`aperiodicAutocorr_zero_of_ge`)."
  - "The weights are all 1 here, unlike [combinedAutocorr](#/node/combinedAutocorr)'s 1, 1, 2, 2. The factor 2 has been absorbed by duplicating Z and W into two longer sequences."
widgets:
  - type: base-seq
    title: "The four base sequences and their lag table"
    config: { preset: tt6 }
quiz:
  - q: "What are the four lengths?"
    type: choice
    choices: ["`n, n, n, n − 1`", "`2n − 1, 2n − 1, n, n`", "`3n − 1` four times", "`2n, 2n, n, n`"]
    answer: 1
    explain: "`a b : PmSeq (2 * n - 1)` and `c d : PmSeq n`."
  - q: "What weights does the vanishing field use?"
    type: choice
    choices: ["1, 1, 2, 2", "1, 1, 1, 1", "2, 2, 1, 1"]
    answer: 1
    explain: "`aperiodicAutocorr a.data s + aperiodicAutocorr b.data s + aperiodicAutocorr c.data s + aperiodicAutocorr d.data s = 0` — a plain sum."
  - q: "Is `BaseSeqData` used by [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard)?"
    type: choice
    choices: ["yes, it is the first stage", "no — the Lean's construction goes from the quadruple straight to a T-sequence"]
    answer: 1
    explain: "`turynToHadamardMatrix T = typedGsMatrixOfTSequence (step2 T)`. `step1` and `BaseSeqData` are proved but unused, and the declaration graph records their depth as `null`."
  - q: "Why is the vanishing condition stated for *all* `s ≥ 1` with no upper bound?"
    type: choice
    choices: ["because the sequences are infinite", "because beyond the longest length every term is `0` anyway", "an oversight"]
    answer: 1
    explain: "[aperiodicAutocorr](#/node/aperiodicAutocorr)'s guard returns `0` for `s ≥ len`, so the unbounded quantifier costs nothing and is easier to use."
---

## Plain English

```
structure BaseSeqData (n : Nat) where
  a : PmSeq (2 * n - 1)
  b : PmSeq (2 * n - 1)
  c : PmSeq n
  d : PmSeq n
  vanishing : ∀ s : Nat, 1 ≤ s →
    aperiodicAutocorr a.data s + aperiodicAutocorr b.data s +
    aperiodicAutocorr c.data s + aperiodicAutocorr d.data s = 0
```

"Base sequences" in the classical sense: four ±1 sequences, two long and two short, whose
aperiodic autocorrelations cancel with **equal weights**. The weights of the Turyn condition have
disappeared because Z and W have been folded into two sequences of length `2n − 1` in a way that
doubles their contributions — see [step1](#/node/step1) for the trick.

It is worth being clear that this is a **side road** in this library. The published route from
Turyn-type sequences to Hadamard matrices goes through base sequences, and `lean/README.md`
describes the pipeline that way, but the Lean's
[turynToHadamardMatrix](#/node/turynToHadamardMatrix) does not: it applies
[step2](#/node/step2) to the quadruple directly. `BaseSeqData` and `step1` are proved correct and
then not used — the declaration graph assigns them no depth, because nothing reachable from the
headline theorems mentions them.
