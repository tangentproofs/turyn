---
id: ofIsTurynTypeMatrix
title: "ofIsTurynTypeMatrix: the user-facing entry point"
summary: "Takes a loose `IsTurynType` certificate and returns the explicit Hadamard matrix of order `4(3n − 1)`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Exactly [turynToHadamardMatrix](#/node/turynToHadamardMatrix) composed with [IsTurynType.toTyped](#/node/IsTurynType.toTyped). It exists so that a user who has proved `IsTurynType myX myY myZ myW` by `native_decide` can get a matrix without mentioning [TurynType](#/node/TurynType)."
  - "A definition. The theorem is [ofIsTurynTypeMatrix_isHadamard](#/node/ofIsTurynTypeMatrix_isHadamard)."
  - "Note it takes the *proof* `h` as an argument and uses it as data (it becomes the `vanishing` field of the record). The matrix's entries do not depend on `h` — proof irrelevance — but Lean needs it to build the record."
quiz:
  - q: "What is its argument?"
    type: choice
    choices: ["a [TurynType n](#/node/TurynType)", "a proof `h : IsTurynType X Y Z W`", "four `PmSeq`s"]
    answer: 1
    explain: "`def ofIsTurynTypeMatrix {n : Nat} {X Y Z : PmSeq n} {W : PmSeq (n - 1)} (h : IsTurynType X Y Z W) : IntMat (4 * (3 * n - 1))`. The sequences are implicit, recovered from `h`'s type."
  - q: "Do the entries of the matrix depend on which proof `h` you pass?"
    type: choice
    choices: ["yes", "no — `IsTurynType` is a `Prop`, so there is at most one proof up to proof irrelevance, and the matrix is built from `X, Y, Z, W`"]
    answer: 1
    explain: "`h` is only used to fill the `vanishing` field of `h.toTyped`, which no part of [gsMatrix](#/node/gsMatrix) reads."
  - q: "Which declaration in the library is an instance of it?"
    type: text
    answer: ["tt6_hadamard", "tt6_hadamard "]
    explain: "`def tt6_hadamard : IntMat 68 := ofIsTurynTypeMatrix tt6_valid`."
---

## Plain English

```
def ofIsTurynTypeMatrix {n : Nat} {X Y Z : PmSeq n} {W : PmSeq (n - 1)}
    (h : IsTurynType X Y Z W) :
    IntMat (4 * (3 * n - 1)) :=
  turynToHadamardMatrix h.toTyped
```

The convenience wrapper, and the one the README tells users to call. You write four `pm!` literals,
prove `IsTurynType` by `native_decide`, hand the proof to this function, and get a matrix.

The two theorems in `Results.lean` are built from it:
[Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) packages this definition together
with [ofIsTurynTypeMatrix_isHadamard](#/node/ofIsTurynTypeMatrix_isHadamard) into the existential
form comparator checks.

A small Lean point: the proof `h` is an *argument used as data*, since it becomes the `vanishing`
field of the record [IsTurynType.toTyped](#/node/IsTurynType.toTyped) builds. That is harmless —
no part of the matrix construction inspects it — but it is why the definition takes a proof rather
than just the four sequences.
