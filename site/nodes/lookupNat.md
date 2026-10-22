---
id: lookupNat
title: "lookupNat: indexing by a plain Nat, with 0 out of range"
summary: "`lookupNat a i` is entry `i` of `a : Fin n → Int` when `i < n`, and `0` otherwise."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The out-of-range value `0` is a deliberate choice, and it is load-bearing: several lemmas rely on terms silently vanishing past the end of a sequence. It also means `lookupNat` can return `0` for a sequence all of whose real entries are ±1, so you cannot conclude `lookupNat a i = 1 ∨ lookupNat a i = -1` without knowing `i < n` (that is the lemma `pm_lookupNat`)."
  - "It is 0-indexed. The 1-indexed accessors [xAt](#/node/xAt) … [wAt](#/node/wAt) are defined as `lookupNat … (i - 1)` with `Nat` subtraction, so `xAt S 0` and `xAt S 1` are the *same* entry."
widgets:
  - type: autocorr
    title: "Where the out-of-range zeros show up"
    config: { seq: "+-++-", s: 3 }
quiz:
  - q: "What is `lookupNat a 7` for `a : Fin 5 → Int`?"
    type: number
    answer: 0
    explain: "`if h : i < n then a ⟨i, h⟩ else 0`, and `7 < 5` is false."
  - q: "Given `AllPmOne a` with `a : Fin 5 → Int`, is `lookupNat a 5 = 1 ∨ lookupNat a 5 = -1`?"
    type: choice
    choices: ["yes", "no — it is `0`"]
    answer: 1
    explain: "`AllPmOne` only constrains the `Fin n` entries. The lemma `pm_lookupNat` therefore carries the hypothesis `hi : i < n`."
  - q: "`lookupNat` is defined with which kind of `if`?"
    type: choice
    choices: ["`if i < n then … else 0`, a Boolean test", "a dependent `if h : i < n then a ⟨i, h⟩ else 0`, so the proof `h` is used to build the `Fin`", "pattern matching on `i`"]
    answer: 1
    explain: "It has to be dependent: `a` expects a `Fin n`, so the branch needs the proof `h : i < n` to construct `⟨i, h⟩`."
  - q: "Which of these is a simp lemma in `Defs.lean`?"
    type: choice
    choices: ["`lookupNat a i = a i`", "`lookupNat a i.1 = a i` for `i : Fin n`", "`lookupNat a i = 0` for every `i`"]
    answer: 1
    explain: "`lookupNat_eq_apply : lookupNat a i.1 = a i`, together with `lookupNat_of_lt` and `lookupNat_of_ge`."
---

## Plain English

The sequences in this library are functions on `Fin n`, so indexing them needs a proof that the
index is in range. That is awkward inside a summation where the index is an ordinary natural
number, so `lookupNat` wraps it: in range, you get the entry; out of range, you get `0`.

```
def lookupNat {n : Nat} (a : Fin n → Int) (i : Nat) : Int :=
  if h : i < n then a ⟨i, h⟩ else 0
```

Two places where the `0` is not just a default but exactly what is wanted:

- [aperiodicAutocorr](#/node/aperiodicAutocorr) sums `lookupNat a i * lookupNat a (i + s)`. Its
  own guard already keeps the index in range, but lemmas that re-index the sum (such as
  `aperiodicAutocorr_of_support` in `TSequence.lean`) lean on terms past the end being 0.
- The 1-indexed accessors return `0` when asked for a position that does not exist. That is why
  [Canonical1](#/node/Canonical1) is unsatisfiable at `n = 1`: it asks for `wAt S 1 = 1`, but `W`
  has length `n - 1 = 0`, so `wAt S 1` is `lookupNat W.data 0 = 0`.

Three simp lemmas cover the uses: `lookupNat_of_lt`, `lookupNat_of_ge` and `lookupNat_eq_apply`.
