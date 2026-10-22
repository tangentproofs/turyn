---
id: IntMat
title: "IntMat n: a square integer matrix"
summary: "`IntMat n` abbreviates `Matrix (Fin n) (Fin n) Int` — Mathlib's matrix type, square, with integer entries."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It is an `abbrev`, so it is transparent: Lean unfolds it freely and all of Mathlib's `Matrix` API applies without a coercion. `Matrix m n α` is itself notation for `m → n → α`, so an `IntMat n` is literally a function of two `Fin n` arguments."
  - "Integer entries, not real or rational. All the matrices built here have entries in `{1, -1}` (or `{0, ±1}` for the reversal matrix), so `Int` is enough and keeps everything decidable."
quiz:
  - q: "`IntMat 68` unfolds to which type?"
    type: choice
    choices: ["`Matrix (Fin 68) (Fin 68) Int`", "`Fin 68 → Int`", "`Matrix (Fin 68) (Fin 68) Real`", "`Array (Array Int)`"]
    answer: 0
    explain: "`abbrev IntMat (n : Nat) := Matrix (Fin n) (Fin n) Int`."
  - q: "Is `IntMat` a `def` or an `abbrev`?"
    type: choice
    choices: ["`def` — opaque unless unfolded", "`abbrev` — reducible, so Mathlib lemmas apply directly"]
    answer: 1
    explain: "Being reducible matters: `H * Hᵀ`, `(n : Int) • (1 : IntMat n)` and the `fromBlocks` machinery all come from Mathlib and need to see through the abbreviation."
  - q: "What are the index types?"
    type: choice
    choices: ["`Nat` for both", "`Fin n` for both", "`Fin n` for rows, `Nat` for columns"]
    answer: 1
    explain: "`Matrix (Fin n) (Fin n) Int`. Square, with bounded indices — so no out-of-range lookups to worry about, unlike the `Nat`-indexed [lookupNat](#/node/lookupNat) on sequences."
---

## Plain English

A one-line abbreviation so the rest of the library can say `IntMat n` instead of
`Matrix (Fin n) (Fin n) Int`:

```
abbrev IntMat (n : Nat) := Matrix (Fin n) (Fin n) Int
```

Mathlib's `Matrix m n α` is a function type `m → n → α` with its own algebraic instances, so
`H i j` is an entry, `H * K` is matrix multiplication (via `Finset.sum` over the shared index),
`Hᵀ` is the transpose, `1` is the identity, and `c • H` is the scalar multiple. All of that is used
in [IsHadamardMat](#/node/IsHadamardMat) and in the Goethals–Seidel block algebra.

The companion abbreviation is [IntVec n](#/node/IntVec) for `Fin n → Int`, used as the seed of a
[circulant](#/node/circulant).
