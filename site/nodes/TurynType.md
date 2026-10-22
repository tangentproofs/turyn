---
id: TurynType
title: "TurynType n: a quadruple with its proof attached"
summary: "A record holding `X, Y, Z : PmSeq n`, `W : PmSeq (n - 1)` and a proof that all the combined autocorrelations at lags `1 ≤ s < n` vanish."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The `vanishing` field is *word for word* the body of [IsTurynType](#/node/IsTurynType). The two declarations are the same mathematics in two packagings: a structure field versus a standalone predicate."
  - "At `n = 0` or `n = 1` the `vanishing` field is vacuous, so `TurynType 1` has 8 inhabitants (up to the proof field, which is irrelevant) and `TurynType 0` has 1."
  - "Record equality here is equality of all four `PmSeq` fields; the proof field is a `Prop` and so irrelevant. Nothing in the library uses `TurynType` equality."
quiz:
  - q: "How many fields does `TurynType n` have?"
    type: number
    answer: 5
    explain: "`X`, `Y`, `Z`, `W` and `vanishing`."
  - q: "Which type does the field `W` have?"
    type: choice
    choices: ["`PmSeq n`", "`PmSeq (n - 1)`", "`SignSeq (n - 1)`", "`Fin (n-1) → Int`"]
    answer: 1
    explain: "`W : PmSeq (n - 1)`, with `Nat` subtraction, so at `n = 0` it is `PmSeq 0`."
  - q: "How do you get a `TurynType n` from a proof `h : IsTurynType X Y Z W`?"
    type: text
    answer: ["IsTurynType.toTyped", "IsTurynType.toTyped h", "h.toTyped", "toTyped", "toTyped h", ".toTyped"]
    explain: "`def IsTurynType.toTyped (h : IsTurynType X Y Z W) : TurynType n := ⟨X, Y, Z, W, h⟩`. The `vanishing` field is `h` itself."
  - q: "Why do theorems like [energy_identity](#/node/energy_identity) take a `TurynType n` instead of four sequences and a hypothesis?"
    type: choice
    choices: ["because the bundled form is stronger", "because it keeps one argument instead of five, and `T.vanishing` is right there when needed", "because `IsTurynType` is not decidable"]
    answer: 1
    explain: "Purely packaging. `energy_identity` reaches the sequences as `T.X.data` and the condition as `T.vanishing`."
---

## Plain English

The same content as [IsTurynType](#/node/IsTurynType), carried in one object:

```
structure TurynType (n : Nat) where
  X : PmSeq n
  Y : PmSeq n
  Z : PmSeq n
  W : PmSeq (n - 1)
  vanishing : ∀ s : Nat, 1 ≤ s → s < n →
    combinedAutocorr X.data Y.data Z.data W.data s = 0
```

A value of this type *is* a TT(n): the sequences and the certificate that they satisfy the
condition. Field names follow the BDKR paper's X, Y, Z, W (older sources use A, B, C, D, and some
of the Lean's helper lemma names still do — `aperiodicAutocorr_A_via_xAt`, `AB_eq_neg2_CD`).

The library uses whichever form is more convenient:

- **Record** (`TurynType n`) for internal theorems that pass the whole quadruple around —
  [energy_identity](#/node/energy_identity), [turyn_vanishing_total](#/node/turyn_vanishing_total),
  [xy_product_law](#/node/xy_product_law), [step2](#/node/step2),
  [canonical_representative_exists](#/node/canonical_representative_exists) — and for everything
  with 1-indexed accessors, since [xAt](#/node/xAt) and friends take an `S : TurynType n`.
- **Predicate** (`IsTurynType`) at the boundary, where a user writes down four `pm!` literals and
  proves the condition by `native_decide`.

[IsTurynType.toTyped](#/node/IsTurynType.toTyped) bridges the first direction; `IsTurynType.vanishing`
(the identity function, kept for readability) bridges the second.

The ten [Elementary](#/node/Elementary) moves are all defined as functions
`TurynType n → TurynType n`: each one rebuilds the record with one sequence altered and a new
`vanishing` field supplied by the corresponding `vanishing_*` lemma. That is a nice demonstration
of what bundling buys you — "negate X" is a total function on valid quadruples, not an operation
that might produce an invalid one.
