---
id: TurynType.doNegX
title: "TurynType.doNegX: the negX move"
summary: "Rebuilds a Turyn-type record with X negated, re-proving the vanishing condition with `vanishing_negX`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A total function `TurynType n → TurynType n`: it cannot produce an invalid quadruple, because the `vanishing` field is supplied by `vanishing_negX`."
  - "Only the X field changes; the other three are copied unchanged."
quiz:
  - q: "Which field of the record changes?"
    type: choice
    choices: ["X", "Y", "Z", "W"]
    answer: 0
    explain: "`⟨S.X.neg, S.Y, S.Z, S.W, Turyn.vanishing_negX S⟩`."
  - q: "Why is the result still Turyn-type?"
    type: choice
    choices: ["it is assumed", "because `vanishing_negX` proves the combined autocorrelations still vanish", "because `n` is even"]
    answer: 1
    explain: "Negating a sequence changes none of its autocorrelations: every product in `N_a(s)` has two factors from `a`, so it picks up two sign flips (`aperiodicAutocorr_negSeqFn`)."
  - q: "What is the length of the sequence this move touches?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 0
    explain: "X has type `PmSeq n`."
---

## Plain English

```
def TurynType.doNegX {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X.neg, S.Y, S.Z, S.W, Turyn.vanishing_negX S⟩
```

One of the ten [Elementary](#/node/Elementary) moves: it negates every entry of X and leaves the other three
sequences alone.

Negating a sequence changes none of its autocorrelations: every product in `N_a(s)` has two factors from `a`, so it picks up two sign flips (`aperiodicAutocorr_negSeqFn`). So the combined autocorrelation `N_X + N_Y + 2N_Z + 2N_W` is unchanged at every lag, and the
new record's `vanishing` field is `vanishing_negX S`.

The bundled sequence operation is [PmSeq.neg](#/node/PmSeq.neg); the underlying
function is [negSeqFn](#/node/negSeqFn).
