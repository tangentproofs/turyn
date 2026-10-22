---
id: TurynType.doRevW
title: "TurynType.doRevW: the revW move"
summary: "Rebuilds a Turyn-type record with W reversed, re-proving the vanishing condition with `vanishing_revW`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A total function `TurynType n → TurynType n`: it cannot produce an invalid quadruple, because the `vanishing` field is supplied by `vanishing_revW`."
  - "Only the W field changes; the other three are copied unchanged."
  - "`W` has length `n - 1`, so this move is the identity whenever `n ≤ 1` — there is nothing to reverse."
quiz:
  - q: "Which field of the record changes?"
    type: choice
    choices: ["X", "Y", "Z", "W"]
    answer: 3
    explain: "`⟨S.X, S.Y, S.Z, S.W.reverse, Turyn.vanishing_revW S⟩`."
  - q: "Why is the result still Turyn-type?"
    type: choice
    choices: ["it is assumed", "because `vanishing_revW` proves the combined autocorrelations still vanish", "because `n` is even"]
    answer: 1
    explain: "Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`)."
  - q: "What is the length of the sequence this move touches?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 1
    explain: "W has type `PmSeq (n - 1)`."
---

## Plain English

```
def TurynType.doRevW {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X, S.Y, S.Z, S.W.reverse, Turyn.vanishing_revW S⟩
```

One of the ten [Elementary](#/node/Elementary) moves: it reverses W and leaves the other three
sequences alone.

Reversing a sequence changes none of its autocorrelations: the products at lag `s` are the same ones, listed in the opposite order (`aperiodicAutocorr_reverseFn`). So the combined autocorrelation `N_X + N_Y + 2N_Z + 2N_W` is unchanged at every lag, and the
new record's `vanishing` field is `vanishing_revW S`.

The bundled sequence operation is [PmSeq.reverse](#/node/PmSeq.reverse); the underlying
function is [reverseFn](#/node/reverseFn).
