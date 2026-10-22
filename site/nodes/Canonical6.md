---
id: Canonical6
title: "Canonical6: which of X and Y is which"
summary: "A tie-breaker between X and Y, with an escape clause: it holds automatically when `n ≤ 2`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It is a three-way disjunction, not an equation: `n ≤ 2`, or (`x₂ ≠ y₂` and `x₂ = 1`), or (`x₂ = y₂` and `x_{n−1} = 1` and `y_{n−1} = -1`)."
  - "The third branch demands two specific signs at position `n − 1`, so it is not merely a comparison — `step6_condition6` has to prove those signs are available, which is where its `n % 2 = 0` hypothesis is used."
  - "The indices are `2` and `n - 1`, not `1` and `n`: those are already pinned to `+1` by [Canonical1](#/node/Canonical1), so they cannot break any tie."
quiz:
  - q: "For which `n` is `Canonical6` automatic?"
    type: choice
    choices: ["`n ≤ 2`", "`n ≤ 4`", "`n` even", "never"]
    answer: 0
    explain: "The first disjunct is literally `n ≤ 2`. At such lengths there is no position `2 ≤ i ≤ n - 1` left to compare."
  - q: "Which positions does the rule read?"
    type: choice
    choices: ["`1` and `n`", "`2` and `n - 1`", "`2` and `n`", "all of them"]
    answer: 1
    explain: "`xAt S 2`, `yAt S 2`, `xAt S (n - 1)`, `yAt S (n - 1)`. Positions 1 and `n` are already `+1` for both X and Y by [Canonical1](#/node/Canonical1)."
  - q: "Which move enforces it?"
    type: choice
    choices: ["`altAll`", "`swap` (exchange X and Y)", "`revX`", "`negY`"]
    answer: 1
    explain: "`Elementary.swap` sends `(X, Y, Z, W)` to `(Y, X, Z, W)`, which is legal because X and Y carry the same weight in [combinedAutocorr](#/node/combinedAutocorr) (`vanishing_swapXY`)."
  - q: "In the branch where `x₂ = y₂`, what does the rule demand?"
    type: choice
    choices: ["`x_{n−1} = 1` and `y_{n−1} = -1`", "`x_{n−1} = y_{n−1}`", "nothing further"]
    answer: 0
    explain: "`(xAt S 2 = yAt S 2 ∧ xAt S (n - 1) = 1 ∧ yAt S (n - 1) = -1)`. If position 2 does not separate X from Y, position `n − 1` must — and in that case the two entries there are opposite."
---

## Plain English

```
def Canonical6 (n : Nat) (S : TurynType n) : Prop :=
  n ≤ 2 ∨
  ((xAt S 2 ≠ yAt S 2 ∧ xAt S 2 = 1) ∨
   (xAt S 2 = yAt S 2 ∧ xAt S (n - 1) = 1 ∧ yAt S (n - 1) = -1))
```

Rule (vi), the last tie-breaker. X and Y play symmetric roles in the vanishing condition, so the
quadruples `(X, Y, Z, W)` and `(Y, X, Z, W)` are always both Turyn-type (`vanishing_swapXY`) and
rules 1–5 cannot tell them apart when X and Y look alike. `Canonical6` picks one.

It reads position 2 first. If `x₂ ≠ y₂`, keep the quadruple with `x₂ = +1`. If they agree, fall
through to position `n − 1` and ask for `x_{n−1} = +1` and `y_{n−1} = −1` — so in that branch the
two sequences are required to be *opposite* there, which is what makes it a genuine
tie-break rather than a preference.

Positions 1 and `n` are no use for this, because [Canonical1](#/node/Canonical1) has already made
`x₁ = xₙ = y₁ = yₙ = +1`. And when `n ≤ 2` there is nothing between them, hence the escape clause.

`step6_condition6` is the lemma that establishes it, and it is the second place (after step 1)
where `n` being even is used.
