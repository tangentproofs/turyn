---
id: yAt
title: "yAt: entry i of Y, counting from 1"
summary: "`yAt S i = lookupNat S.Y.data (i - 1)` — the same 1-indexed accessor as [xAt](#/node/xAt), reading the `Y` field."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Same two traps as [xAt](#/node/xAt): `Nat` subtraction makes `yAt S 0 = yAt S 1`, and out-of-range indices give `0` rather than an error."
  - "In the Lean's helper lemmas Y is sometimes still called B (the older A, B, C, D naming): `aperiodicAutocorr_B_via_yAt`, `AB_eq_neg2_CD`."
quiz:
  - q: "`yAt S i` is defined as what?"
    type: text
    answer: ["lookupNat S.Y.data (i - 1)", "lookupNat (S.Y.data) (i - 1)", "_root_.lookupNat S.Y.data (i - 1)"]
    explain: "Identical in shape to [xAt](#/node/xAt), on the `Y` field."
  - q: "What is `yAt S n` for a `Canonical1` quadruple?"
    type: number
    answer: 1
    explain: "[Canonical1](#/node/Canonical1) asks for `yAt S 1 = 1 ∧ yAt S n = 1` among its six conditions."
  - q: "Which identity relates `yAt` to [xAt](#/node/xAt) and [uAt](#/node/uAt), for `1 ≤ i ≤ n`?"
    type: choice
    choices: ["`yAt S i = xAt S i + uAt S i`", "`yAt S i = xAt S i * uAt S i`", "`yAt S i = uAt S i - xAt S i`"]
    answer: 1
    explain: "`yAt_eq_xAt_mul_uAt`: since `uAt S i = xAt S i * yAt S i` and `xAt S i * xAt S i = 1`, multiplying through by `xAt S i` gives `xAt S i * uAt S i = yAt S i`. This re-parametrization (replace Y by the product sequence U) is the first move of the XY-law proof."
---

## Plain English

```
def yAt {n : Nat} (S : TurynType n) (i : Nat) : Int := lookupNat S.Y.data (i - 1)
```

Nothing new beyond [xAt](#/node/xAt) — see that node for the `Nat`-subtraction and out-of-range
behaviour. What `yAt` is *for* is the pairing with X.

Because `xAt S i` squares to 1 on the valid range, the two sequences X and Y can be traded for X
and their product `U`:

`yAt S i = xAt S i * uAt S i`

That is `yAt_eq_xAt_mul_uAt`, and it is how `Turyn/XY.lean` rewrites `N_X(s) + N_Y(s)` as a sum of
terms `xᵢxⱼ(1 + uᵢuⱼ)` — each factor `1 + uᵢuⱼ` being either `0` or `2`, which is where the
modulo-4 counting in [the XY law](#/node/xy_product_law) comes from.
