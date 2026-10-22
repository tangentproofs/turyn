---
id: step2c
title: "step2c: (X + Y)/2 in the last n positions"
summary: "The third row of the T-sequence: the half-sum of X and Y on positions `[2n−1, 3n−1)`, and `0` elsewhere."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Integer division. Because `xᵢ, yᵢ ∈ {±1}`, the numerator `xᵢ + yᵢ` is in `{−2, 0, 2}`, so the division is exact and no rounding convention matters."
  - "Each entry is `0` when `xᵢ ≠ yᵢ` and `±1` when they agree — so this row is non-zero at exactly the positions where [step2d](#/node/step2d) is zero."
quiz:
  - q: "What is the entry when `xᵢ = 1` and `yᵢ = -1`?"
    type: number
    answer: 0
    explain: "`(1 + (-1))/2 = 0`. The half-*difference* row carries that position instead."
  - q: "What is the entry when `xᵢ = yᵢ = -1`?"
    type: number
    answer: -1
    explain: "`(-1 + -1)/2 = -1`. Exact division, no rounding."
  - q: "Which positions does the row occupy?"
    type: choice
    choices: ["`[0, n)`", "`[n, 2n−1)`", "`[2n−1, 3n−1)`"]
    answer: 2
    explain: "`if h : i.1 < 2 * n - 1 then 0 else …`, with the index into X and Y being `i.1 - (2 * n - 1)`."
---

## Plain English

```
def step2c {n : Nat} (T : TurynType n) : Fin (3 * n - 1) → Int :=
  fun i =>
    if h : i.1 < 2 * n - 1 then 0
    else (T.X.data ⟨i.1 - (2 * n - 1), _⟩ + T.Y.data ⟨i.1 - (2 * n - 1), _⟩) / 2
```

Row `c`: the half-sum `(X + Y)/2`, sitting in the final `n` positions.

For ±1 inputs, `(x + y)/2` is `x` when `x = y` and `0` when `x ≠ y`. So this row records *where X
and Y agree, and what they agree on*. The companion row [step2d](#/node/step2d) records where they
disagree. Exactly one of the two is non-zero at each position, which is the `support` half of
[step2](#/node/step2).

The autocorrelation side is `halfSum_halfDiff_autocorr`:

`2(N_{(X+Y)/2}(s) + N_{(X−Y)/2}(s)) = N_X(s) + N_Y(s)`

so splitting X and Y this way costs exactly the factor 2 that the Turyn weights supply.
