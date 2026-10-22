---
id: tt6_hadamard
title: "tt6_hadamard: an explicit 68 × 68 Hadamard matrix"
summary: "The matrix the pipeline builds from TT(6), written down as a definition of type `IntMat 68`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is a **definition**, not a theorem: by itself it only says 'here is a 68 × 68 integer matrix'. Its Hadamard property is the separate theorem [tt6_hadamard_isHadamard](#/node/tt6_hadamard_isHadamard)."
  - "The declared type is `IntMat 68`, while [ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix) returns `IntMat (4 * (3 * n - 1))`. These type-check as the same because `4 * (3 * 6 - 1)` reduces to `68`; Lean does that reduction itself, no coercion is involved."
  - "It depends on [tt6_valid](#/node/tt6_valid), which is proved by `native_decide`, so the definition inherits that trust assumption. See [#/trust](#/trust)."
widgets:
  - type: hadamard
    title: "The matrix, and the H · Hᵗ check"
    config: { source: tt6 }
quiz:
  - q: "What is `tt6_hadamard`?"
    type: choice
    choices: ["a theorem that a 68 × 68 Hadamard matrix exists", "a definition: the specific matrix the pipeline builds from TT(6)", "a Boolean check", "a list of sequences"]
    answer: 1
    explain: "`def tt6_hadamard : IntMat 68 := ofIsTurynTypeMatrix tt6_valid`. The claim that it is Hadamard is `tt6_hadamard_isHadamard`."
  - q: "How many entries does it have?"
    type: number
    answer: 4624
    explain: "68 × 68 = 4624, each `1` or `-1` (that part is proved in [tt6_hadamard_isHadamard](#/node/tt6_hadamard_isHadamard))."
  - q: "Where does `68` come from?"
    type: text
    answer: ["4 * (3 * 6 - 1)", "4(3 * 6 - 1)", "4(3n-1) with n=6", "4(3n − 1) at n = 6", "4 * 17", "4·17", "4 x 17", "hadamardOrder 6"]
    explain: "`4 * (3 * n - 1)` at `n = 6` is `4 * 17 = 68`. [hadamardOrder](#/node/hadamardOrder) is the same formula as a named function."
  - q: "`IntMat 68` unfolds to which Mathlib type?"
    type: choice
    choices: ["`Matrix (Fin 68) (Fin 68) Int`", "`Fin 68 → Int`", "`List (List Int)`", "`Matrix (Fin 68) (Fin 68) Real`"]
    answer: 0
    explain: "`abbrev IntMat (n : Nat) := Matrix (Fin n) (Fin n) Int`. Being an `abbrev`, it is transparent to the elaborator."
---

## Plain English

A Hadamard matrix of order 68, as a concrete object inside Lean.

It is built by handing the TT(6) certificate to [ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix),
which bundles the quadruple, runs [step2](#/node/step2) to get a T-sequence of length
`3·6 − 1 = 17`, combines its four rows into four ±1 vectors, and drops their
[circulants](#/node/circulant) into the Goethals–Seidel 4 × 4 block array — `4 · 17 = 68` rows in
all.

Being a definition, it computes: Lean can evaluate any entry, and the widget above does exactly
that in JavaScript, then checks `H · Hᵗ = 68 · I` numerically. That check is an illustration; the
proof is [tt6_hadamard_isHadamard](#/node/tt6_hadamard_isHadamard), which holds for reasons that
have nothing to do with evaluating 4624 entries.

## In the Lean

```
def tt6_hadamard : IntMat 68 :=
  ofIsTurynTypeMatrix tt6_valid
```

The interesting thing here is the type. `ofIsTurynTypeMatrix` has result type
`IntMat (4 * (3 * n - 1))`, which at `n = 6` is `IntMat (4 * (3 * 6 - 1))`. Writing `IntMat 68` is
accepted because those two `Nat`s are definitionally equal — Lean reduces the arithmetic. At an
unknown `n` you could not do this, which is why the general theorems carry the formula around
instead of a number.
