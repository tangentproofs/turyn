---
id: uAt
title: "uAt: the product sequence U = X · Y"
summary: "`uAt S i = xAt S i * yAt S i`, the pointwise product of X and Y at 1-indexed position `i`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "There is no `PmSeq` called `U` in the library. `uAt` is only an accessor; `U` exists as a sequence in the prose and in the widgets, not as a Lean object."
  - "`uAt S i` is ±1 only for `1 ≤ i ≤ n` (lemma `uAt_pm`). Out of that range both factors are `0`, so `uAt S i = 0`."
  - "Same `Nat`-subtraction behaviour as the accessors it is built from: `uAt S 0 = uAt S 1`."
widgets:
  - type: xy-law
    title: "The u row, and its mirror"
    config: { preset: tt6 }
quiz:
  - q: "`uAt S i` is defined as what?"
    type: text
    answer: ["xAt S i * yAt S i", "xAt S i*yAt S i", "x_i * y_i"]
    explain: "`def uAt {n : Nat} (S : TurynType n) (i : Nat) : Int := xAt S i * yAt S i`."
  - q: "For `1 ≤ i ≤ n`, what is `uAt S i * uAt S i`?"
    type: number
    answer: 1
    explain: "`uAt_sq`: a product of two ±1 values is ±1, and any ±1 value squares to 1."
  - q: "Under [Canonical1](#/node/Canonical1), what is `uAt S 1`?"
    type: number
    answer: 1
    explain: "`uAt_one_of_canonical1_head`: `Canonical1` gives `xAt S 1 = 1` and `yAt S 1 = 1`, so their product is 1. The same holds at `i = n` (`uAt_one_of_canonical1_tail`), which is why the [XY law](#/node/Result.xy_interior_antipalindrome) excludes the two ends."
  - q: "What is `uAt S i` for `i > n`?"
    type: number
    answer: 0
    explain: "Both `xAt S i` and `yAt S i` fall out of range and return `0`, so the product is `0`. This is why `uAt_pm` carries the hypotheses `1 ≤ i` and `i ≤ n`."
---

## Plain English

```
def uAt {n : Nat} (S : TurynType n) (i : Nat) : Int := xAt S i * yAt S i
```

Multiply X and Y entry by entry. Since both are ±1, so is the product (on the valid range), and
`U` is a ±1 sequence of length `n` in its own right — though the Lean never builds it as a
[PmSeq](#/node/PmSeq); it just reads it off position by position.

Why bother? Because the pair `(X, Y)` and the pair `(X, U)` carry the same information
(`yAt S i = xAt S i * uAt S i`, from `xAt S i ² = 1`), and `U` is where the structure lives. The
[XY law](#/node/Result.xy_interior_antipalindrome) says that for a `Canonical1` quadruple with
`n ≥ 4`, `U` is an anti-palindrome on its interior:

`u_{n+1−k} = −u_k` for `2 ≤ k ≤ n − 1`

The two ends sit outside that range on purpose: `Canonical1` pins `u₁ = uₙ = 1`.

For [TT(6)](#/node/tt6_valid), `X = ----+-` and `Y = ---+--` give `U = +++--+`, i.e.
`u = (1, 1, 1, −1, −1, 1)`. The interior pairs are `(u₂, u₅) = (1, −1)` and
`(u₃, u₄) = (1, −1)` — opposite, as the law requires. (That quadruple is not itself `Canonical1`,
but negating all four sequences makes it so, and it leaves `U` untouched: X and Y each change sign,
so their product does not.)
