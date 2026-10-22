---
id: step2d
title: "step2d: (X − Y)/2 in the last n positions"
summary: "The fourth row of the T-sequence: the half-difference of X and Y on positions `[2n−1, 3n−1)`, and `0` elsewhere."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Exact integer division, for the same reason as [step2c](#/node/step2c): `xᵢ − yᵢ ∈ {−2, 0, 2}`."
  - "Non-zero exactly where [step2c](#/node/step2c) is zero: at the positions where X and Y disagree."
quiz:
  - q: "What is the entry when `xᵢ = yᵢ = 1`?"
    type: number
    answer: 0
    explain: "`(1 - 1)/2 = 0`. The half-*sum* row carries that position."
  - q: "What is the entry when `xᵢ = -1` and `yᵢ = 1`?"
    type: number
    answer: -1
    explain: "`(-1 - 1)/2 = -1`."
  - q: "At a position `i` in the final block (`2n − 1 ≤ i < 3n − 1`), how many of `step2c T i` and `step2d T i` are non-zero?"
    type: number
    answer: 1
    explain: "Exactly one, by `natAbs_halfSum_add_natAbs_halfDiff_eq_one`, proved `by decide` on the four sign cases. Before the final block both rows are `0` — there the non-zero entry is in row a or row b."
---

## Plain English

```
def step2d {n : Nat} (T : TurynType n) : Fin (3 * n - 1) → Int :=
  fun i =>
    if h : i.1 < 2 * n - 1 then 0
    else (T.X.data ⟨i.1 - (2 * n - 1), _⟩ - T.Y.data ⟨i.1 - (2 * n - 1), _⟩) / 2
```

Row `d`: the half-difference. It records *where X and Y disagree*, with the sign of X there.

Together, [step2c](#/node/step2c) and `step2d` repackage the pair `(X, Y)` into two `{0, ±1}` rows
with complementary support. No information is lost — you can recover `X = c + d` and `Y = c − d` —
and the pair's autocorrelations add up to half of X's and Y's, which is exactly what the
T-sequence's unweighted condition needs.
