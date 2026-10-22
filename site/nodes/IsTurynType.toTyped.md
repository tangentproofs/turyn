---
id: IsTurynType.toTyped
title: "toTyped: certificate to record"
summary: "Packs four sequences and a proof of [IsTurynType](#/node/IsTurynType) into a [TurynType n](#/node/TurynType) record."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It is a relabelling, nothing more: the `vanishing` field *is* the hypothesis `h`, because [IsTurynType](#/node/IsTurynType) and `TurynType`'s field have literally the same body."
  - "There is no inverse named `toCertificate`; the other direction is `IsTurynType.vanishing`, which the file notes is the identity function and keeps only for readability."
quiz:
  - q: "What does the `vanishing` field of the result contain?"
    type: choice
    choices: ["a new proof built from `h`", "`h` itself", "a `decide` call"]
    answer: 1
    explain: "`{ X := X, Y := Y, Z := Z, W := W, vanishing := h }`. The two statements are definitionally identical."
  - q: "Why does the library have both forms?"
    type: choice
    choices: ["historical accident", "the predicate is the convenient user-facing form (decidable, `native_decide`-able); the record is convenient inside proofs that pass the quadruple around", "the record is stronger"]
    answer: 1
    explain: "`IsTurynType` has a `Decidable` instance via `isTurynTypeBool`; `TurynType` is what [xAt](#/node/xAt), [step2](#/node/step2) and the canonicalization theory take."
  - q: "Is `toTyped` a definition or a theorem?"
    type: choice
    choices: ["a definition", "a theorem"]
    answer: 0
    explain: "`def IsTurynType.toTyped … : TurynType n`. It produces data, so it has to be a `def`."
---

## Plain English

```
def IsTurynType.toTyped {n : Nat} {X Y Z : PmSeq n} {W : PmSeq (n - 1)}
    (h : IsTurynType X Y Z W) : TurynType n :=
  { X := X, Y := Y, Z := Z, W := W, vanishing := h }
```

The adapter between the library's two ways of saying the same thing. Since
[IsTurynType](#/node/IsTurynType) was *defined* to be the body of `TurynType`'s `vanishing` field,
the conversion is free: the proof you already have is the field you need.

Used by [ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix) and
[ofIsTurynTypeMatrix_isHadamard](#/node/ofIsTurynTypeMatrix_isHadamard), which is how a
`native_decide` certificate about concrete sequences reaches the general pipeline.
