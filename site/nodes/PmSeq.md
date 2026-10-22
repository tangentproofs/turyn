---
id: PmSeq
title: "PmSeq n: a ±1 sequence of length n"
summary: "A record pairing a function `Fin n → Int` with a proof that every one of its entries is `1` or `-1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Entries are `Int`, not a two-element type. The ±1 restriction is carried as a *proof field*, so two `PmSeq n` values with the same `data` are equal only up to proof irrelevance — fine here, since `AllPmOne` is a `Prop`."
  - "Indexing is 0-based: `s.data i` for `i : Fin n`. The 1-indexed accessors [xAt](#/node/xAt) … [wAt](#/node/wAt) exist separately, for fidelity with the papers."
  - "`PmSeq 0` is a perfectly good type with exactly one inhabitant (the empty function, whose `AllPmOne` obligation is vacuous). This matters: at `n = 1` the `W` of a quadruple has type `PmSeq (1 - 1) = PmSeq 0`."
widgets:
  - type: seq-editor
    title: "Four PmSeq values you can edit"
    config: { preset: tt6, show: [bars] }
quiz:
  - q: "How many fields does `PmSeq n` have?"
    type: number
    answer: 2
    explain: "`data : Fin n → Int` and `pm : AllPmOne data`. The second is a proof, not data you can choose freely."
  - q: "How many values does `PmSeq 0` have?"
    type: number
    answer: 1
    explain: "There is exactly one function `Fin 0 → Int` (the empty one) and its `AllPmOne` obligation `∀ i : Fin 0, …` is vacuously true. So `PmSeq 0` is a one-element type, not empty."
  - q: "Could a `PmSeq 4` have an entry equal to `0`?"
    type: choice
    choices: ["yes, `Int` allows it", "no — the `pm` field rules it out", "only at index 0"]
    answer: 1
    explain: "`AllPmOne data` is `∀ i, data i = 1 ∨ data i = -1`. A `0` entry would make that field unprovable. For `{0, ±1}` entries the library has [SignSeq](#/node/SignSeq)."
  - q: "How is the ±1 condition stated: as a `Bool` or as a `Prop`?"
    type: choice
    choices: ["a `Bool` field", "a `Prop` field ([AllPmOne](#/node/AllPmOne))", "neither, it is an axiom"]
    answer: 1
    explain: "`pm : AllPmOne data`, and `AllPmOne` is a `Prop`. `Turyn/TurynType.lean` adds the `Bool` mirror `allPmOne` on lists plus decidability instances, which is what `pm!` literals use."
---

## Plain English

`PmSeq n` is "a length-`n` row of pluses and minuses", as a single Lean object. It has two parts:

- `data : Fin n → Int` — the entries, indexed `0, 1, …, n−1`;
- `pm : AllPmOne data` — a proof that each entry is `1` or `-1`.

Bundling the proof into the type means every theorem downstream can use ±1-ness without carrying
a hypothesis. [IsTurynType](#/node/IsTurynType) is a good example: it takes three `PmSeq n` and one
`PmSeq (n - 1)`, so the lengths and the ±1 condition are already settled and the only thing left
to say is that the autocorrelations vanish.

In practice you never write the fields out. `pm! "++--"` ([pmSeq!](#/node/pmSeq!) +
[PmSeq.ofList](#/node/PmSeq.ofList)) builds a `PmSeq 4` from a string and discharges both
obligations with `decide`.

## In the Lean

```
structure PmSeq (n : Nat) where
  data : Fin n → Int
  pm : AllPmOne data
```

Three small consequences worth knowing:

- The carrier is a *function*, not a list. That is why [aperiodicAutocorr](#/node/aperiodicAutocorr)
  needs [lookupNat](#/node/lookupNat) to index it by a plain `Nat`.
- There is a list view, `PmSeq.toList = List.ofFn s.data`, with simp lemmas, kept for older
  proof scripts.
- `PmSeq.toSign` lifts a `PmSeq n` to a [SignSeq n](#/node/SignSeq), since `±1` is in particular
  `{0, ±1}`.
