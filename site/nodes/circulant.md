---
id: circulant
title: "circulant: one vector, shifted into a square"
summary: "`circulant x i j = x (j - i)`, where `j - i` is subtraction in `Fin n` — each row is the previous one shifted by one, cyclically."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The index arithmetic is `Fin n` subtraction, so it wraps. There is no `NeZero n` requirement on the definition itself, though a few of its lemmas (`circulant_diag`, `circulant_row_zero`) need it to talk about index `0`."
  - "Mathlib has its own `Matrix.circulant`; this is the project's own definition with the convention `x (j - i)`, which makes row 0 equal to `x` itself."
quiz:
  - q: "What is the `(i, j)` entry?"
    type: choice
    choices: ["`x (i - j)`", "`x (j - i)`", "`x (i + j)`", "`x i * x j`"]
    answer: 1
    explain: "`def circulant {n : Nat} (x : IntVec n) : IntMat n := fun i j => x (j - i)`."
  - q: "What is row `0` of `circulant x`?"
    type: choice
    choices: ["`x` itself", "`x` reversed", "the constant `x 0`"]
    answer: 0
    explain: "`circulant_row_zero : circulant x 0 j = x j` (for `n` non-zero)."
  - q: "What is on the diagonal?"
    type: choice
    choices: ["`x 0`, repeated", "`x i` at row `i`", "zeros"]
    answer: 0
    explain: "`circulant_diag : circulant x i i = x 0`, since `i - i = 0`."
  - q: "What is entry `(i, j)` of `circulant x * (circulant y)ᵀ`?"
    type: choice
    choices: ["`∑ k, x (k - i) * y (k - j)`", "`x i * y j`", "`periodicAutocorr x (i - j)`"]
    answer: 0
    explain: "`circulant_mul_transpose_apply`. When `y = x`, re-indexing turns it into `periodicAutocorr x (i - j)` — that is `circulant_mul_transpose_eq_periodicAutocorr`, and it is why [periodicAutocorr](#/node/periodicAutocorr) is the right notion on the matrix side."
---

## Plain English

```
def circulant {n : Nat} (x : IntVec n) : IntMat n :=
  fun i j => x (j - i)
```

Take a vector and write it as the first row; each next row is the same vector rotated one place to
the right. For `x = (x₀, x₁, x₂)`:

```
x₀ x₁ x₂
x₂ x₀ x₁
x₁ x₂ x₀
```

Circulants are the reason this whole construction works, because of one identity:

`(circulant x · (circulant x)ᵀ) i j = periodicAutocorr x (i − j)`

So a circulant's Gram matrix is read off directly from the periodic autocorrelations of its seed.
If every non-zero shift gives `0`, the Gram matrix is `x`'s squared length times the identity. Four
circulants whose periodic autocorrelations *jointly* cancel therefore satisfy

`A·Aᵀ + B·Bᵀ + C·Cᵀ + D·Dᵀ = 4n · I`

(`four_circulant_products_eq`), and that is the hypothesis the Goethals–Seidel array needs.

The array also uses two twisted variants: `M * reversalMatrix n` (`circulant` with its columns
reversed) and [trCirculant x](#/node/trCirculant) `= (circulant x)ᵀ * reversalMatrix n`. The
reversal matrix is what makes the off-diagonal blocks of the big product cancel rather than add,
and `Turyn/MatUtils.lean` is a small library of commutation lemmas for exactly these three shapes.
