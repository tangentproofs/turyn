---
id: TurynType.doNegW
title: "TurynType.doNegW: the negW move"
summary: "Rebuilds a Turyn-type record with W negated, re-proving the vanishing condition with `vanishing_negW`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A total function `TurynType n → TurynType n`: it cannot produce an invalid quadruple, because the `vanishing` field is supplied by `vanishing_negW`."
  - "Only the W field changes; the other three are copied unchanged."
  - "`W` has length `n - 1`, so this move is the identity whenever `n ≤ 1` — there is nothing to negate."
quiz:
  - q: "Which field of the record changes?"
    type: choice
    choices: ["X", "Y", "Z", "W"]
    answer: 3
    explain: "`⟨S.X, S.Y, S.Z, S.W.neg, Turyn.vanishing_negW S⟩`."
  - q: "Why is the result still Turyn-type?"
    type: choice
    choices: ["it is assumed", "because `vanishing_negW` proves the combined autocorrelations still vanish", "because `n` is even"]
    answer: 1
    explain: "Negating a sequence changes none of its autocorrelations: every product in `N_a(s)` has two factors from `a`, so it picks up two sign flips (`aperiodicAutocorr_negSeqFn`)."
  - q: "What is the length of the sequence this move touches?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 1
    explain: "W has type `PmSeq (n - 1)`."
---

## Plain English

```
def TurynType.doNegW {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X, S.Y, S.Z, S.W.neg, Turyn.vanishing_negW S⟩
```

One of the ten [Elementary](#/node/Elementary) moves: it negates every entry of W and leaves the other three
sequences alone.

Negating a sequence changes none of its autocorrelations: every product in `N_a(s)` has two factors from `a`, so it picks up two sign flips (`aperiodicAutocorr_negSeqFn`). So the combined autocorrelation `N_X + N_Y + 2N_Z + 2N_W` is unchanged at every lag, and the
new record's `vanishing` field is `vanishing_negW S`.

The bundled sequence operation is [PmSeq.neg](#/node/PmSeq.neg); the underlying
function is [negSeqFn](#/node/negSeqFn).
