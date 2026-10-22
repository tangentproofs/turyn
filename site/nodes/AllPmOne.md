---
id: AllPmOne
title: "AllPmOne: every entry is +1 or −1"
summary: "`AllPmOne a` is the proposition `∀ i : Fin n, a i = 1 ∨ a i = -1`, for a function `a : Fin n → Int`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It is a `Prop`, not a `Bool`. `Turyn/TurynType.lean` defines the list-based `Bool` version `allPmOne` with the bridge `allPmOne_iff`, and that pair is what makes `pm!` literals and `native_decide` possible. The `Fin`-based `AllPmOne` itself has no decidability instance registered."
  - "`AllPmOne` on a function `Fin 0 → Int` is vacuously true, which is what makes `PmSeq 0` inhabited."
quiz:
  - q: "`AllPmOne a` says each entry is which of these?"
    type: choice
    choices: ["`1` or `-1`", "`0`, `1` or `-1`", "non-zero", "of absolute value at most 1"]
    answer: 0
    explain: "`∀ i : Fin n, a i = 1 ∨ a i = -1`. The three-valued version is [AllSignOne](#/node/AllSignOne)."
  - q: "Is `AllPmOne (a : Fin 0 → Int)` true?"
    type: choice
    choices: ["yes, vacuously", "no", "it is undecidable"]
    answer: 0
    explain: "A `∀` over the empty type `Fin 0` holds with no work. This is why [PmSeq 0](#/node/PmSeq) has an inhabitant."
  - q: "Is `AllPmOne` a `Bool`-valued function?"
    type: choice
    choices: ["yes", "no, it is a `Prop`"]
    answer: 1
    explain: "`def AllPmOne {n : Nat} (a : Fin n → Int) : Prop`. The `Bool` mirror `allPmOne : List Int → Bool` lives in `Turyn/TurynType.lean`."
  - q: "If `AllPmOne a`, what is `a i * a i`?"
    type: number
    answer: 1
    explain: "`1 * 1 = 1` and `(-1) * (-1) = 1`. This is the lemma `pmone_sq`, and it is the reason the diagonal of a sum-of-squares expansion contributes exactly the length — see [sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr)."
---

## Plain English

The ±1 condition, written as a proposition about a function.

```
def AllPmOne {n : Nat} (a : Fin n → Int) : Prop := ∀ i : Fin n, a i = 1 ∨ a i = -1
```

That is all. It is used as the proof field of [PmSeq](#/node/PmSeq), and it appears as an explicit
hypothesis in the few theorems that work with raw carriers rather than bundled records —
[sum_sq_eq_len_add_two_totalAutocorr](#/node/sum_sq_eq_len_add_two_totalAutocorr) is the main one.

The single most used consequence is `a i * a i = 1`. Every ±1 identity in the library — the
energy identity, the half-sum/half-difference trick in [step2](#/node/step2), the mod-4 counting in
the XY law — is downstream of that one fact.

## Why two versions?

Lean distinguishes propositions from Booleans. `AllPmOne` is a `Prop`: good for stating theorems,
no good for running a check. For the concrete examples the library needs a check that *runs*, so
`Turyn/TurynType.lean` adds

```
def allPmOne (a : List Int) : Bool := a.all fun v => v == 1 || v == -1
theorem allPmOne_iff (a : List Int) : allPmOne a = true ↔ AllPmOneList a
```

on lists, plus the decidability instance that `allPmOne_iff` yields. `pm! "----+-"` uses it: the
`decide` calls hidden in the macro discharge both the length and the ±1 obligation.
