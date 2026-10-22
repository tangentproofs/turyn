---
id: tt6_hadamard_isHadamard
title: "The 68 × 68 matrix really is Hadamard"
summary: "`IsHadamardMat tt6_hadamard`: every entry of the matrix built from TT(6) is ±1, and `H · Hᵀ = 68 · I`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The orthogonality is **not** checked by computing the 68 × 68 product. The proof is `ofIsTurynTypeMatrix_isHadamard tt6_valid` — the general theorem, instantiated. The only computation anywhere in the chain is the 5-lag check inside [tt6_valid](#/node/tt6_valid)."
  - "Because `tt6_valid` is proved by `native_decide`, this theorem's axiom list includes `Lean.ofReduceBool` and `Lean.trustCompiler` on top of the standard three, even though its own proof is pure algebra. Axiom dependencies are inherited. See [#/trust](#/trust)."
widgets:
  - type: hadamard
    title: "Row orthogonality, visibly"
    config: { source: tt6 }
quiz:
  - q: "[IsHadamardMat](#/node/IsHadamardMat) is a conjunction of how many conditions?"
    type: number
    answer: 2
    explain: "Entrywise ±1 (`∀ i j, H i j = 1 ∨ H i j = -1`) and `H * Hᵀ = (n : Int) • (1 : IntMat n)`. Nothing about determinants or symmetry."
  - q: "How is the orthogonality established here?"
    type: choice
    choices: ["by evaluating the 68 × 68 matrix product", "by instantiating the general theorem `ofIsTurynTypeMatrix_isHadamard` at TT(6)", "by `native_decide`", "by `decide +kernel`"]
    answer: 1
    explain: "`theorem tt6_hadamard_isHadamard : IsHadamardMat tt6_hadamard := ofIsTurynTypeMatrix_isHadamard tt6_valid`. The algebra is done once, for all `n`, in `Turyn/GoethalsSeidel.lean`."
  - q: "What is the right-hand side of the orthogonality equation for this matrix?"
    type: choice
    choices: ["`68 • I`", "`17 • I`", "`I`", "`68 • 68 • I`"]
    answer: 0
    explain: "`H * Hᵀ = (n : Int) • (1 : IntMat n)` with `n = 68`: the diagonal entries are 68 and the off-diagonal ones 0."
  - q: "Does this theorem depend on `Lean.ofReduceBool`?"
    type: choice
    choices: ["no — its proof is pure algebra", "yes — through `tt6_valid`, which uses `native_decide`"]
    answer: 1
    explain: "Axioms propagate through dependencies. The algebra is kernel-checked, but the fact that *this particular* quadruple is Turyn-type was established by compiled code."
---

## Plain English

Put the two previous nodes together: [tt6_hadamard](#/node/tt6_hadamard) is a 68 × 68 integer
matrix, and this theorem says it is a Hadamard matrix — all entries `±1`, and any two distinct
rows are orthogonal (which is what `H · Hᵀ = 68 · I` says: each row dotted with itself gives 68,
each row dotted with another gives 0).

The proof is a one-liner, and that is the point. The hard work —
[typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard), the circulant algebra of the
Goethals–Seidel array — was done once for every `n`. All this declaration does is plug in the
TT(6) certificate.

## In the Lean

```
theorem tt6_hadamard_isHadamard :
    IsHadamardMat tt6_hadamard := by
  exact ofIsTurynTypeMatrix_isHadamard tt6_valid
```

If you want the same thing for your own quadruple, the recipe in `lean/README.md` is exactly
these two declarations with your sequences substituted.
