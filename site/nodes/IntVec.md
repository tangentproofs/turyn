---
id: IntVec
title: "IntVec n: a length-n integer vector"
summary: "`IntVec n` abbreviates `Fin n → Int`, the carrier used as the seed of a circulant matrix."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "`IntVec n` and the `data` field of a [PmSeq n](#/node/PmSeq) have exactly the same type. The abbreviation exists only to signal intent on the matrix side of the library."
  - "No sign condition is attached. The ±1 version is `IsPmOneVec`, a separate predicate in `Turyn/MatUtils.lean`."
quiz:
  - q: "`IntVec n` is which type?"
    type: choice
    choices: ["`Fin n → Int`", "`List Int` of length `n`", "`Matrix (Fin n) (Fin 1) Int`", "`Vector Int n`"]
    answer: 0
    explain: "`abbrev IntVec (n : Nat) := Fin n → Int`."
  - q: "Does `IntVec n` restrict entries to ±1?"
    type: choice
    choices: ["yes", "no — that is the separate predicate `IsPmOneVec`"]
    answer: 1
    explain: "`def IsPmOneVec {n : Nat} (x : IntVec n) : Prop := ∀ i, x i = 1 ∨ x i = -1`, which is the `IntVec` analogue of [AllPmOne](#/node/AllPmOne)."
  - q: "Where are `IntVec`s used?"
    type: choice
    choices: ["as the rows of a Hadamard matrix", "as the seeds of circulants and the arguments of [periodicAutocorr](#/node/periodicAutocorr)", "as the sequences of a TT(n)"]
    answer: 1
    explain: "[circulant](#/node/circulant) takes an `IntVec n` and returns an `IntMat n`; `periodicAutocorr` takes an `IntVec n` and a `Fin n` shift."
---

## Plain English

```
abbrev IntVec (n : Nat) := Fin n → Int
```

The same thing as a `PmSeq`'s `data` field, named differently because it is used differently. On
the sequence side of the library a `Fin n → Int` is a row of signs; on the matrix side it is the
first row of a [circulant](#/node/circulant), or the argument of
[periodicAutocorr](#/node/periodicAutocorr), whose shift is a `Fin n` so that the wrap-around is
Mathlib's `Fin` addition.
