---
id: TurynType.doRevY
title: "TurynType.doRevY: the revY move"
summary: "Rebuilds a Turyn-type record with Y reversed, re-proving the vanishing condition with `vanishing_revY`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A total function `TurynType n → TurynType n`: it cannot produce an invalid quadruple, because the `vanishing` field is supplied by `vanishing_revY`."
  - "Only the Y field changes; the other three are copied unchanged."
quiz:
  - q: "Which field of the record changes?"
    type: choice
    choices: ["X", "Y", "Z", "W"]
    answer: 1
    explain: "`⟨S.X, S.Y.reverse, S.Z, S.W, Turyn.vanishing_revY S⟩`."
  - q: "Why is the result still Turyn-type?"
    type: choice
    choices: ["it is assumed", "because `vanishing_revY` proves the combined autocorrelations still vanish", "because `n` is even"]
    answer: 1
    explain: "Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`)."
  - q: "What is the length of the sequence this move touches?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 0
    explain: "Y has type `PmSeq n`."
---

## Plain English

```
def TurynType.doRevY {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X, S.Y.reverse, S.Z, S.W, Turyn.vanishing_revY S⟩
```

One of the ten [Elementary](#/node/Elementary) moves: it reverses Y and leaves the other three
sequences alone.

Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`). So the combined autocorrelation `N_X + N_Y + 2N_Z + 2N_W` is unchanged at every lag, and the
new record's `vanishing` field is `vanishing_revY S`.

The bundled sequence operation is [PmSeq.reverse](#/node/PmSeq.reverse); the underlying
function is [reverseFn](#/node/reverseFn).
