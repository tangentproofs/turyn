---
id: gsDataOfTSequence
title: "gsDataOfTSequence: from a T-sequence to certified array input"
summary: "Forms the four ± combinations of a T-sequence's rows and proves they are ±1 with vanishing combined periodic autocorrelation."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Both structure fields of the input are used: `support` gives the ±1-ness of the combinations, and `periodic_vanishing` (with [tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity)) gives the vanishing field."
  - "The length does not change: a `TSequence m` yields a `CertifiedGSData m`, and the matrix built from it is `4m × 4m`."
quiz:
  - q: "What does it return?"
    type: choice
    choices: ["a [GSData m](#/node/GSData)", "a [CertifiedGSData m](#/node/CertifiedGSData)", "an [IntMat (4 * m)](#/node/IntMat)"]
    answer: 1
    explain: "`def gsDataOfTSequence {m : Nat} (T : TSequence m) : CertifiedGSData m`. The matrix comes one step later, from `typedGsMatrixOfTSequence`."
  - q: "Which field of the input proves the four combinations are ±1?"
    type: choice
    choices: ["`support`", "`periodic_vanishing`", "the `SignSeq` fields"]
    answer: 0
    explain: "`tseqCombine1_pmOne … tseqCombine4_pmOne` all start with `have h := T.support i`."
  - q: "How does the `periodic_vanishing` field get proved?"
    type: choice
    choices: ["by `native_decide`", "rewrite with `tseqCombine_periodic_identity`, then use `T.periodic_vanishing s hs` to make the right-hand side `4 * 0`", "by assumption"]
    answer: 1
    explain: "`have h := tseqCombine_periodic_identity T s; rw [T.periodic_vanishing s hs] at h; simp at h; exact h`."
---

## Plain English

```
def gsDataOfTSequence {m : Nat} (T : TSequence m) : CertifiedGSData m :=
  { x1 := tseqCombine1 T, x2 := tseqCombine2 T, x3 := tseqCombine3 T, x4 := tseqCombine4 T
    x1_pm := tseqCombine1_pmOne T, …
    periodic_vanishing := … }
```

The hinge between the sequence world and the matrix world. It takes a
[T-sequence](#/node/TSequence) — four `{0, ±1}` rows that tile and cancel — and produces four ±1
vectors that still cancel, which is what the Goethals–Seidel array wants.

Both halves come straight from the input's two fields:

- **±1.** At each position exactly one of `a, b, c, d` is non-zero (`T.support`), so each
  combination `±a ±b ±c ±d` is `±1` there. (Lemma: `natAbs_four_sum_eq_one_pmOne`, proved by
  `omega` after a case split on the three signs.)
- **Cancellation.** [tseqCombine_periodic_identity](#/node/tseqCombine_periodic_identity) says the
  four combined periodic autocorrelations sum to `4 ×` the original four, and
  `T.periodic_vanishing` makes the original four sum to `0`.

After this, nothing remembers where the T-sequence came from — which is why
[typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) is stated for an arbitrary
`TSequence m`, with the TT(n) story confined to [step2](#/node/step2).
