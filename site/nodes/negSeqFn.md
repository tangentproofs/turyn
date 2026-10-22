---
id: negSeqFn
title: "negSeqFn: negate every entry"
summary: "`negSeqFn a = fun i => -(a i)` — pointwise negation of a function-typed sequence."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Operates on the bare carrier `Fin n → Int`. The bundled version is `PmSeq.neg`, which adds the preservation proof `negSeqFn_AllPmOne`."
quiz:
  - q: "What is `aperiodicAutocorr (negSeqFn a) s`?"
    type: choice
    choices: ["`-(aperiodicAutocorr a s)`", "`aperiodicAutocorr a s` — unchanged", "`0`"]
    answer: 1
    explain: "`aperiodicAutocorr_negSeqFn`. Each product `aᵢ·a_{i+s}` picks up two minus signs, so it is unchanged. This is why negating any one sequence is an [Elementary](#/node/Elementary) move."
  - q: "Does negation preserve [AllPmOne](#/node/AllPmOne)?"
    type: choice
    choices: ["yes (`negSeqFn_AllPmOne`)", "no"]
    answer: 0
    explain: "`-1` and `1` swap places."
  - q: "Where is it used in [step1](#/node/step1)?"
    type: choice
    choices: ["to build `B = Z ++ (−W)`", "to build `A = Z ++ W`", "nowhere"]
    answer: 0
    explain: "`let castB := appendFn T.Z.data (negSeqFn T.W.data)`. The sign flip on the second copy of W is what cancels the mixed Z–W products."
---

## Plain English

```
def negSeqFn {n : Nat} (a : Fin n → Int) : Fin n → Int := fun i => -(a i)
```

Pointwise negation, with one important consequence: it changes no autocorrelation at all, because
every product in `N_a(s)` has two factors from `a` and so gains two sign flips
(`aperiodicAutocorr_negSeqFn`). That is why `negX`, `negY`, `negZ`, `negW` are all legal
[Elementary](#/node/Elementary) moves, and why endpoint signs can be normalized freely
([Canonical1](#/node/Canonical1)).

Used by [step1](#/node/step1) to build the second base sequence `B = Z ++ (−W)`, and by
`PmSeq.neg`, the bundled form that re-proves [AllPmOne](#/node/AllPmOne).
