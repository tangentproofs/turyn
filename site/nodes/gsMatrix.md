---
id: gsMatrix
title: "gsMatrix: the Goethals–Seidel 4 × 4 block array"
summary: "Assembles four ±1 vectors into a `4n × 4n` matrix of sixteen `n × n` blocks, each a circulant or a reversed/transposed circulant, with a fixed sign pattern."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The definition is given entrywise (`gsMatrixEntry`), by computing `i / n` and `i % n` to find which block an index is in and where in that block. It is *also* described as a genuine block matrix (`gsBlockMatrix`, using Mathlib's `fromBlocks`), and `gsMatrix_eq_reindex_gsBlockMatrix` proves the two agree. The proofs are done in the block picture; the entrywise form is what gets evaluated."
  - "At `n = 0` the index arithmetic would divide by zero, so `gsMatrixEntry` guards the `Fin` constructions; the resulting matrix is the empty one, and everything is vacuous."
  - "The diagonal blocks are all `circulant x1` — the *same* block four times, not four different ones."
widgets:
  - type: gs-array
    title: "The sixteen blocks, and the matrix they make"
    config: { preset: tt6 }
quiz:
  - q: "What size is `gsMatrix G` for `G : GSData n`?"
    type: choice
    choices: ["`n × n`", "`4n × 4n`", "`(3n−1) × (3n−1)`"]
    answer: 1
    explain: "`def gsMatrix {n : Nat} (G : GSData n) : IntMat (4 * n)`. Sixteen blocks of size `n × n`."
  - q: "Which block sits on the diagonal?"
    type: choice
    choices: ["`circulant x1`, in all four positions", "`circulant x1, x2, x3, x4` in turn", "the identity"]
    answer: 0
    explain: "In `gsMatrixEntry`, the cases `0,0`, `1,1`, `2,2`, `3,3` all give `gsA G = circulant G.x1`."
  - q: "How does `gsMatrixEntry` decide which block an index pair is in?"
    type: choice
    choices: ["by pattern matching on a sum type", "by computing `i.1 / n` and `i.1 % n`", "by a lookup table"]
    answer: 1
    explain: "`let bi := i.1 / n; let ii : Fin n := ⟨i.1 % n, _⟩` and likewise for `j`, then a `match bi, bj with`. The sum-typed `gsBlockMatrix` is the clean version, related by `gsMatrix_eq_reindex_gsBlockMatrix`."
  - q: "For a TT(6) input, what is the order of the resulting matrix?"
    type: number
    answer: 68
    explain: "The T-sequence has length `3 · 6 − 1 = 17`, so `n = 17` here and the array is `4 · 17 = 68` square."
---

## Plain English

The classical Goethals–Seidel array (1967), typed. Given four ±1 vectors `x1, x2, x3, x4` of
length `n`, write `A = circulant x1`, `B = circulant x2`, `C = circulant x3`, `D = circulant x4`,
let `R` be the [reversal matrix](#/node/reversalMatrix), and build

```
⎡  A      B·R     C·R     D·R  ⎤
⎢ −B·R     A      Dᵗ·R   −Cᵗ·R ⎥
⎢ −C·R   −Dᵗ·R     A      Bᵗ·R ⎥
⎣ −D·R    Cᵗ·R   −Bᵗ·R     A   ⎦
```

(in the Lean, `Dᵗ·R` is written [trCirculant](#/node/trCirculant) `x4`.) Every block is a
rearrangement of one of the four seeds, so all `16n²` entries are ±1 — that is `gsMatrix_pmOne`,
and it needs nothing but [GSData](#/node/GSData).

The sign pattern is the whole trick. When you form `H · Hᵀ`, each off-diagonal block comes out as a
difference of two terms that the circulant commutation lemmas show to be equal, so it vanishes;
each diagonal block comes out as `A·Aᵀ + B·Bᵀ + C·Cᵀ + D·Dᵀ`, which is `4n · I` exactly when the
four periodic autocorrelations cancel ([CertifiedGSData](#/node/CertifiedGSData)).

## Two presentations

The Lean defines the matrix entrywise, by dividing an index by `n` to find its block:

```
def gsMatrixEntry {n : Nat} (G : GSData n) : Fin (4 * n) → Fin (4 * n) → Int :=
  fun i j => … match i.1 / n, j.1 / n with | 0, 0 => gsA G ii jj | 0, 1 => (gsB G * reversalMatrix n) ii jj | …

def gsMatrix {n : Nat} (G : GSData n) : IntMat (4 * n) := gsMatrixEntry G
```

That form computes, which is what the examples need. For *proving*, the file switches to
`gsBlockMatrix`, the same matrix over the index type `(Fin n ⊕ Fin n) ⊕ (Fin n ⊕ Fin n)` built with
Mathlib's nested `fromBlocks`, where block algebra is available. `gsBlockEquiv` is the explicit
bijection between the two index types and `gsMatrix_eq_reindex_gsBlockMatrix` connects them.
