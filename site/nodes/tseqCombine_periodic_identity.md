---
id: tseqCombine_periodic_identity
title: "The four combinations multiply the autocorrelations by 4"
summary: "The sum of the four combined vectors' periodic autocorrelations at shift `s` is exactly `4 ×` the sum of the T-sequence's own four."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It holds at **every** shift `s : Fin m`, including `s = 0`. No hypothesis beyond having a [TSequence](#/node/TSequence) — in fact the `support` field is not used at all; the identity is pure algebra on the four rows."
  - "The factor 4 is the point, not the content: what matters is that there are no cross terms. That is `tseqCombine_summand_identity`, a `ring` identity on eight integer variables."
quiz:
  - q: "What is the factor on the right-hand side?"
    type: number
    answer: 4
    explain: "`= 4 * (periodicAutocorr T.a.data s + periodicAutocorr T.b.data s + periodicAutocorr T.c.data s + periodicAutocorr T.d.data s)`."
  - q: "Does the identity need `s ≠ 0`?"
    type: choice
    choices: ["yes", "no — it holds for every `s : Fin m`"]
    answer: 1
    explain: "`theorem tseqCombine_periodic_identity {m : Nat} (T : TSequence m) (s : Fin m)`. The `s ≠ 0` restriction appears only when the identity is *used*, to conclude the right-hand side is 0."
  - q: "Which field of `TSequence` does the proof use?"
    type: choice
    choices: ["`support`", "`periodic_vanishing`", "neither — just the four rows"]
    answer: 2
    explain: "The proof is `simp only [periodicAutocorr, tseqCombine1, …]` followed by a pointwise `ring` identity. Both structure fields are used by the *caller*, [gsDataOfTSequence](#/node/gsDataOfTSequence)."
  - q: "Why are there no cross terms?"
    type: choice
    choices: ["because the rows have disjoint support", "because the four sign patterns are mutually orthogonal", "because `m` is odd"]
    answer: 1
    explain: "`(a+b+c+d)(a'+b'+c'+d') + (a+b−c−d)(a'+b'−c'−d') + (a−b+c−d)(a'−b'+c'−d') + (a−b−c+d)(a'−b'−c'+d') = 4(aa' + bb' + cc' + dd')`. Each mixed product appears with both signs. That is `tseqCombine_summand_identity`, proved `by ring`."
---

## Plain English

```
theorem tseqCombine_periodic_identity {m : Nat} (T : TSequence m) (s : Fin m) :
    periodicAutocorr (tseqCombine1 T) s + periodicAutocorr (tseqCombine2 T) s +
    periodicAutocorr (tseqCombine3 T) s + periodicAutocorr (tseqCombine4 T) s =
    4 * (periodicAutocorr T.a.data s + periodicAutocorr T.b.data s +
         periodicAutocorr T.c.data s + periodicAutocorr T.d.data s)
```

The step where the T-sequence's cancellation is handed over to the matrix side.

The reason it works is a single algebraic identity, applied at each position pair:

```
(a+b+c+d)(a′+b′+c′+d′) + (a+b−c−d)(a′+b′−c′−d′)
  + (a−b+c−d)(a′−b′+c′−d′) + (a−b−c+d)(a′−b′−c′+d′)
= 4 (aa′ + bb′ + cc′ + dd′)
```

Every mixed term like `ab′` appears four times with signs `+ + − −`, so it cancels; every
matched term `aa′` appears four times with sign `+`. In the Lean this is
`tseqCombine_summand_identity`, discharged `by ring`, and the theorem follows by pushing the sums
around.

The consequence: if the T-sequence's four periodic autocorrelations sum to `0` at a shift, so do
the four combinations' — so the combined vectors form a [CertifiedGSData](#/node/CertifiedGSData),
which is exactly what [gsDataOfTSequence](#/node/gsDataOfTSequence) assembles.

The four sign patterns are the rows of a 4 × 4 Hadamard matrix; the identity above is the statement
that it has orthogonal rows, applied coordinatewise. That is the orthogonal-design mechanism the
whole construction turns on.
