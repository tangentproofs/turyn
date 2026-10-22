---
id: reversalMatrix
title: "reversalMatrix: the back-diagonal permutation R"
summary: "`reversalMatrix n` has a `1` wherever `j = n − 1 − i` and `0` elsewhere: multiplying by it reverses rows or columns."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Entries are `{0, 1}`, so it is *not* a ±1 matrix and is not itself Hadamard. It is only used as a factor inside the Goethals–Seidel blocks."
  - "It is symmetric (`reversalMatrix_transpose`) and an involution (`reversalMatrix_mul_reversalMatrix : R * R = 1`)."
quiz:
  - q: "Where are the `1`s?"
    type: choice
    choices: ["on the diagonal", "on the back diagonal, at `j = n - 1 - i`", "in the first row"]
    answer: 1
    explain: "`fun i j => if j = revFin i then 1 else 0`, with `revFin i = ⟨n - 1 - i.1, _⟩`."
  - q: "What is `R * R`?"
    type: choice
    choices: ["`R`", "the identity", "the zero matrix"]
    answer: 1
    explain: "`reversalMatrix_mul_reversalMatrix`. Reversing twice is the identity, since `revFin` is an involution."
  - q: "What is `Rᵀ`?"
    type: choice
    choices: ["`R`", "`-R`", "the identity"]
    answer: 0
    explain: "`reversalMatrix_transpose : (reversalMatrix n)ᵀ = reversalMatrix n` — the back diagonal is symmetric."
  - q: "Is `reversalMatrix n` a Hadamard matrix?"
    type: choice
    choices: ["yes", "no — its entries are `0` and `1`, not ±1"]
    answer: 1
    explain: "[IsHadamardMat](#/node/IsHadamardMat) requires every entry to be `1` or `-1`. `R` is a permutation matrix; it appears only as a factor inside the array's blocks."
---

## Plain English

```
def revFin {n : Nat} (i : Fin n) : Fin n := ⟨n - 1 - i.1, _⟩

def reversalMatrix (n : Nat) : IntMat n :=
  fun i j => if j = revFin i then 1 else 0
```

The permutation matrix with ones along the back diagonal:

```
0 0 1
0 1 0
1 0 0
```

Multiplying on the left reverses the row order (`reversalMatrix_mul_apply : (R * M) i j = M (revFin i) j`);
on the right it reverses the columns (`mul_reversalMatrix_apply : (M * R) i j = M i (revFin j)`).
It is symmetric and squares to the identity.

Why does the Goethals–Seidel array need it? Because the four circulant blocks `A, B, C, D` commute
with each other (circulants of the same size always do), and `A · Bᵀ = B · Aᵀ` would make the
off-diagonal blocks of `H · Hᵀ` *add* rather than cancel. Inserting `R` breaks that: the useful
identity is `(C · R)ᵀ = R · Cᵀ`, so a block like `C·R` behaves like a transposed circulant when it
moves across a product, and the signs in the array can be arranged so that everything off the
diagonal cancels in pairs. `Turyn/MatUtils.lean` and the first half of
`Turyn/GoethalsSeidel.lean` are the commutation lemmas that make that precise, in particular
`circulant_reversalMatrix`, `circulant_transpose_reversalMatrix` and
`circulant_reversalMatrix_transpose_comm`.
