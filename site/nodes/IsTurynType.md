---
id: IsTurynType
title: "IsTurynType: the vanishing condition"
summary: "`IsTurynType X Y Z W` says that at every lag `s` with `1 ≤ s < n`, the combined autocorrelation `N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s)` is zero."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The ±1 condition and the lengths are **not** part of this predicate — they are in the types `PmSeq n` and `PmSeq (n - 1)` of its arguments. So `IsTurynType` is purely the vanishing condition."
  - "At `n = 0` and `n = 1` the condition is **vacuous**: there is no `s` with `1 ≤ s < n`. Every ±1 triple of length 1 (with the empty `W`) is therefore a TT(1) — eight of them, since `2^3 = 8` and `W : PmSeq 0` has one value."
  - "The upper bound is `s < n`, not `s < n - 1` or `s ≤ n`. Lags at or beyond `n` are automatically zero anyway, by the guard in [aperiodicAutocorr](#/node/aperiodicAutocorr); lag `n - 1` is a real constraint, and in fact the most informative one (it reads `x₁xₙ + y₁yₙ + 2z₁zₙ = 0`, since the `W` term has slid clear)."
  - "It is a `Prop`. The runnable version is `isTurynTypeBool`, proved equivalent by `isTurynTypeBool_iff_IsTurynType`; that equivalence is what registers the `Decidable` instance and so lets `native_decide` prove [tt6_valid](#/node/tt6_valid) and [kharaghani_2005_tt36](#/node/kharaghani_2005_tt36)."
widgets:
  - type: seq-editor
    title: "Edit a quadruple and watch the verdict"
    config: { preset: tt6, show: [bars, table] }
quiz:
  - q: "At `n = 1`, how many lags does `IsTurynType` constrain?"
    type: number
    answer: 0
    explain: "`1 ≤ s → s < 1` has no solutions, so the condition is vacuously true. Every `(X, Y, Z, W)` of shape `(1, 1, 1, 0)` is a TT(1)."
  - q: "Does `IsTurynType X Y Z W` say anything about the entries being ±1?"
    type: choice
    choices: ["yes, it is part of the definition", "no — that is carried by the `PmSeq` types of the arguments"]
    answer: 1
    explain: "The body is only `∀ s : Nat, 1 ≤ s → s < n → combinedAutocorr … s = 0`. The ±1 condition lives in [PmSeq](#/node/PmSeq)'s `pm` field."
  - q: "How many lags are checked at `n = 6`?"
    type: number
    answer: 5
    explain: "`s = 1, 2, 3, 4, 5`. The Boolean version folds over `List.range (n - 1)`, which has the same five elements shifted by one."
  - q: "What does the vanishing condition at lag `s = n - 1` reduce to (for `n ≥ 2`)?"
    type: choice
    choices: ["`x₁xₙ + y₁yₙ + 2z₁zₙ = 0`", "`0 = 0`", "`x₁ = y₁`", "the energy identity"]
    answer: 0
    explain: "At lag `n - 1` each of X, Y, Z contributes exactly one product, its two end entries, and `W` (length `n - 1`) contributes nothing because the guard `s ≥ n` fires. That is `endpoint_relation` in `Turyn/Equivalence.lean`."
  - q: "`IsTurynType` is a `Prop`. How does Lean ever *run* it?"
    type: choice
    choices: ["it cannot", "through `isTurynTypeBool` and `isTurynTypeBool_iff_IsTurynType`, which give a `Decidable` instance", "by `simp`"]
    answer: 1
    explain: "`instance : Decidable (IsTurynType X Y Z W) := decidable_of_iff _ (isTurynTypeBool_iff_IsTurynType X Y Z W)`. `native_decide` then compiles the Boolean form."
---

## ELI5

Four rows of pluses and minuses are "Turyn-type" if a certain adding-up game always lands on
exactly zero. Slide each row along itself by one step, then two, and so on. Each slide gives four
numbers; add them up, counting the third and fourth twice. If you get zero for every slide, the
four rows are special, and a big matrix can be built from them.

## Plain English

```
def IsTurynType {n : Nat} (X Y Z : PmSeq n) (W : PmSeq (n - 1)) : Prop :=
  ∀ s : Nat, 1 ≤ s → s < n →
    combinedAutocorr X.data Y.data Z.data W.data s = 0
```

Everything about shape is already in the signature: three sequences of length `n`, one of length
`n - 1`, all with ±1 entries. What `IsTurynType` adds is one equation per lag:

`N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s) = 0` for `s = 1, 2, …, n − 1`.

That is `n − 1` equations in `4n − 1` sign variables. Solutions are rare: a brute-force count over
all quadruples finds 8 at `n = 1`, 32 at `n = 2`, **none** at `n = 3`, 128 at `n = 4`, none at
`n = 5`, and 1536 at `n = 6`. (Those counts come from this site's JavaScript mirror, not from the
Lean — see the caveat about illustrations on the widgets.)

### The bundled twin

[TurynType n](#/node/TurynType) is the same information as a record: the four sequences *plus* the
vanishing proof in one object. [IsTurynType.toTyped](#/node/IsTurynType.toTyped) converts a
certificate into a record, and `IsTurynType.vanishing` goes the other way (it is the identity,
since the two bodies are literally the same formula). Theorems that need to pass the quadruple
around — [energy_identity](#/node/energy_identity), the [XY law](#/node/xy_product_law) — take the
record; theorems stated as an entry point for users take the certificate.

## Why `s < n` and not `s ≤ n - 1`

They are the same range for `n ≥ 1`, and for `n = 0` both are empty. The form `s < n` is simply
easier to use with `omega`, and it is what the `Bool` mirror's `List.range (n - 1)` lines up with
after the shift `s = i + 1`.
