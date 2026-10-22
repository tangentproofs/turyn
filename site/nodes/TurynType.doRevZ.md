---
id: TurynType.doRevZ
title: "TurynType.doRevZ: the revZ move"
summary: "Rebuilds a Turyn-type record with Z reversed, re-proving the vanishing condition with `vanishing_revZ`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A total function `TurynType n → TurynType n`: it cannot produce an invalid quadruple, because the `vanishing` field is supplied by `vanishing_revZ`."
  - "Only the Z field changes; the other three are copied unchanged."
quiz:
  - q: "Which field of the record changes?"
    type: choice
    choices: ["X", "Y", "Z", "W"]
    answer: 2
    explain: "`⟨S.X, S.Y, S.Z.reverse, S.W, Turyn.vanishing_revZ S⟩`."
  - q: "Why is the result still Turyn-type?"
    type: choice
    choices: ["it is assumed", "because `vanishing_revZ` proves the combined autocorrelations still vanish", "because `n` is even"]
    answer: 1
    explain: "Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`)."
  - q: "What is the length of the sequence this move touches?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 0
    explain: "Z has type `PmSeq n`."
---

## Plain English

```
def TurynType.doRevZ {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X, S.Y, S.Z.reverse, S.W, Turyn.vanishing_revZ S⟩
```

One of the ten [Elementary](#/node/Elementary) moves: it reverses Z and leaves the other three
sequences alone.

Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`). So the combined autocorrelation `N_X + N_Y + 2N_Z + 2N_W` is unchanged at every lag, and the
new record's `vanishing` field is `vanishing_revZ S`.

The bundled sequence operation is [PmSeq.reverse](#/node/PmSeq.reverse); the underlying
function is [reverseFn](#/node/reverseFn).
