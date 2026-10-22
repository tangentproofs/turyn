---
id: tseqCombine4_pmOne
title: "tseqCombine4 is entrywise ±1"
summary: "`IsPmOneVec (tseqCombine4 T)`: the `+ − − +` combination of a T-sequence's four rows has every entry `1` or `-1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The only input is the T-sequence's `support` field. Nothing about autocorrelations is needed."
  - "The proof route is to rewrite the combination as `a + s_b·b + s_c·c + s_d·d` with explicit ±1 coefficients and apply `natAbs_four_sum_eq_one_pmOne`, which is an `omega` after splitting on the three signs."
quiz:
  - q: "Which field of [TSequence](#/node/TSequence) does the proof use?"
    type: choice
    choices: ["`support`", "`periodic_vanishing`", "both"]
    answer: 0
    explain: "`have h := T.support i` is the first line. The four `natAbs` values add to 1, so exactly one summand is non-zero and it is ±1."
  - q: "Could the combination ever be `0`?"
    type: choice
    choices: ["yes, if two rows cancel", "no — at each position only one of the four rows is non-zero"]
    answer: 1
    explain: "There is nothing to cancel against. That is precisely what `support` rules out."
  - q: "Could it ever be `2`?"
    type: choice
    choices: ["yes", "no, for the same reason"]
    answer: 1
    explain: "Two non-zero summands at one position would make the `natAbs` total at least 2, contradicting `support`."
---

## Plain English

```
lemma tseqCombine4_pmOne {m : Nat} (T : TSequence m) : IsPmOneVec (tseqCombine4 T)
```

One of four near-identical lemmas. The `+ − − +` combination
([tseqCombine4](#/node/tseqCombine4)) of a [T-sequence](#/node/TSequence)'s rows is
entrywise ±1, because at each position exactly one of the four rows is non-zero and the sign
pattern only decides whether to keep or flip it.

The shared core is

```
natAbs_four_sum_eq_one_pmOne (a b c d sb sc sd : Int)
  (hsb : sb = 1 ∨ sb = -1) … (h_support : a.natAbs + b.natAbs + c.natAbs + d.natAbs = 1) :
  (a + sb * b + sc * c + sd * d) = 1 ∨ (a + sb * b + sc * c + sd * d) = -1
```

proved by `rcases … <;> omega`. Each of the four lemmas supplies its own sign triple. Together
they give [gsDataOfTSequence](#/node/gsDataOfTSequence) the four `IsPmOneVec` fields of a
[GSData](#/node/GSData).
