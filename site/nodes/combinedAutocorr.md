---
id: combinedAutocorr
title: "combinedAutocorr: the weighted sum 1, 1, 2, 2"
summary: "`combinedAutocorr x y z w s` is `N_x(s) + N_y(s) + 2·N_z(s) + 2·N_w(s)`, the quantity a Turyn-type quadruple must send to zero at every non-zero lag below `n`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The function takes two length parameters, `{n m : Nat}`: `x, y, z : Fin n → Int` but `w : Fin m → Int`. The constraint `m = n - 1` is imposed by the callers ([IsTurynType](#/node/IsTurynType), [TurynType](#/node/TurynType)), not here."
  - "Nothing in this definition requires ±1 entries. It is plain arithmetic on four integer-valued functions."
  - "The weights 1, 1, 2, 2 are not symmetric: X and Y are interchangeable with each other, and Z and W with each other, but you cannot swap X with Z. That asymmetry is why only `swap` (X ↔ Y) is among the ten [Elementary](#/node/Elementary) moves."
widgets:
  - type: seq-editor
    title: "The C(s) column is this function"
    config: { preset: tt6, show: [bars, table] }
quiz:
  - q: "What are the four weights?"
    type: choice
    choices: ["1, 1, 1, 1", "1, 1, 2, 2", "1, 2, 2, 1", "2, 2, 1, 1"]
    answer: 1
    explain: "`aperiodicAutocorr x s + aperiodicAutocorr y s + 2 * aperiodicAutocorr z s + 2 * aperiodicAutocorr w s`."
  - q: "Does `combinedAutocorr` require its arguments to be ±1 sequences?"
    type: choice
    choices: ["yes", "no — it is defined for any `Fin n → Int`"]
    answer: 1
    explain: "The signature is `{n m : Nat} (x y z : Fin n → Int) (w : Fin m → Int) (s : Nat)`. The ±1 condition enters through the `PmSeq` arguments of its callers."
  - q: "Compute `combinedAutocorr` at `s = 1` for TT(6) (`N_X = 1`, `N_Y = 1`, `N_Z = -1`, `N_W = 0`)."
    type: number
    answer: 0
    explain: "`1 + 1 + 2(-1) + 2(0) = 0`, as [tt6_valid](#/node/tt6_valid) requires at every lag from 1 to 5."
  - q: "Can `x` and `w` be swapped without changing the value?"
    type: choice
    choices: ["yes, the sum is symmetric", "no — they carry different weights (and different lengths)"]
    answer: 1
    explain: "`x` is weighted 1 and `w` is weighted 2. Only the X ↔ Y swap is a symmetry of this expression, which is `Elementary.swap`."
---

## Plain English

One number per lag, combining all four sequences:

```
def combinedAutocorr {n m : Nat} (x y z : Fin n → Int) (w : Fin m → Int) (s : Nat) : Int :=
  aperiodicAutocorr x s + aperiodicAutocorr y s +
  2 * aperiodicAutocorr z s + 2 * aperiodicAutocorr w s
```

The docstrings write it `C(s) = N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s)`, and the widgets print it
in a column headed `C(s)`. Being Turyn-type means this is `0` for `s = 1, …, n − 1`.

The weights are what make the construction work. Downstream, Z and W get concatenated into
sequences of length `2n − 1` (in the base-sequence picture) or laid side by side in the
T-sequence, and a pair `(Z ++ W, Z ++ (−W))` contributes each Z–Z and W–W product *twice* while
the mixed Z–W products cancel — hence the factor 2. X and Y get folded into `(X+Y)/2` and
`(X−Y)/2`, which contribute once each. [step1](#/node/step1) and [step2](#/node/step2) are where
you can see that bookkeeping happen.

Because the weights differ, the only sequence-level symmetry visible in this formula is swapping
X with Y. (Swapping Z with W would not even type-check at different lengths.)
