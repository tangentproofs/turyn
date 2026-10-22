---
id: gsMatrixEntry
title: "gsMatrixEntry: the array, written out entry by entry"
summary: "Computes the `(i, j)` entry of the Goethals–Seidel array by locating the block with `i / n` and `j / n` and the position within it with `i % n` and `j % n`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The `match` has a catch-all `| _, _ => 0` branch for block indices above 3. It is unreachable for `i, j : Fin (4 * n)`, but Lean needs it because `i.1 / n` is a plain `Nat`."
  - "Both `Fin n` constructions carry an inline proof that `i.1 % n < n`, which needs `n ≠ 0`; the definition handles `n = 0` by deriving a contradiction from `i.1 < 4 * 0`."
  - "This entrywise form is what *computes*. The proofs are all done on `gsBlockMatrix`, the same matrix over a sum index type, and `gsMatrix_eq_reindex_gsBlockMatrix` connects them."
widgets:
  - type: gs-array
    title: "The sixteen blocks"
    config: { preset: tt6 }
quiz:
  - q: "How does it find which block `(i, j)` is in?"
    type: choice
    choices: ["`i.1 / n` and `j.1 / n`", "`i.1 % 4`", "a lookup table"]
    answer: 0
    explain: "`let bi : Nat := i.1 / n; let bj : Nat := j.1 / n`, then `match bi, bj with …`. The position inside the block is `i.1 % n`."
  - q: "What sits in block position `(1, 2)`?"
    type: choice
    choices: ["`gsA G`", "`trCirculant G.x4`", "`-(gsB G * reversalMatrix n)`", "`0`"]
    answer: 1
    explain: "`| 1, 2 => trCirculant G.x4 ii jj`. The sixteen cases are listed in full in the definition; see [gsMatrix](#/node/gsMatrix) for the array in matrix form."
  - q: "Why is there a `| _, _ => 0` branch?"
    type: choice
    choices: ["for `n = 0`", "because `i.1 / n` is a `Nat` and Lean cannot see that it is at most 3", "it is dead code left over"]
    answer: 1
    explain: "`i.1 < 4 * n` does give `i.1 / n < 4`, but the `match` is on a `Nat`, so the exhaustiveness checker wants a default. The branch is never taken."
  - q: "Which blocks are negated?"
    type: choice
    choices: ["none", "`(1,0), (1,3), (2,0), (2,1), (3,0), (3,2)`", "all the off-diagonal ones"]
    answer: 1
    explain: "Reading the `match`: `1,0`, `1,3`, `2,0`, `2,1`, `3,0` and `3,2`. That sign pattern is what makes the off-diagonal blocks of `H · Hᵗ` cancel."
---

## Plain English

```
def gsMatrixEntry {n : Nat} (G : GSData n) : Fin (4 * n) → Fin (4 * n) → Int :=
  fun i j =>
    let bi : Nat := i.1 / n
    let bj : Nat := j.1 / n
    let ii : Fin n := ⟨i.1 % n, _⟩
    let jj : Fin n := ⟨j.1 % n, _⟩
    match bi, bj with
    | 0, 0 => gsA G ii jj
    | 0, 1 => (gsB G * reversalMatrix n) ii jj
    …
    | 3, 3 => gsA G ii jj
    | _, _ => 0
```

The Goethals–Seidel array as a computable function on `Fin (4n) × Fin (4n)`. The index pair is
split by division: `i / n` says which of the four block rows, `i % n` where inside it.

The sixteen cases, laid out:

| | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| **0** | `A` | `B·R` | `C·R` | `D·R` |
| **1** | `−B·R` | `A` | `Dᵗ·R` | `−Cᵗ·R` |
| **2** | `−C·R` | `−Dᵗ·R` | `A` | `Bᵗ·R` |
| **3** | `−D·R` | `Cᵗ·R` | `−Bᵗ·R` | `A` |

with `A = ` [gsA](#/node/gsA) `G`, `B = ` [gsB](#/node/gsB) `G` and so on, `R = `
[reversalMatrix](#/node/reversalMatrix) `n`, and `Xᵗ·R = ` [trCirculant](#/node/trCirculant).

[gsMatrix](#/node/gsMatrix) is this function viewed as an [IntMat (4 * n)](#/node/IntMat). The
reason there are two presentations is that this one evaluates but is awkward to reason about: the
proofs work with `gsBlockMatrix`, the same array over the sum index type
`(Fin n ⊕ Fin n) ⊕ (Fin n ⊕ Fin n)` where Mathlib's `fromBlocks` algebra is available, and
`gsMatrix_eq_reindex_gsBlockMatrix` transports results back. The eight private `div_block*` and
`mod_block*` lemmas are the arithmetic that makes the transport work.
