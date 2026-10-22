---
id: step2b
title: "step2b: W in positions [n, 2n−1)"
summary: "The second row of the T-sequence: `W` placed just after Z's block, and `0` elsewhere."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Two nested dependent `if`s, because the window `[n, 2n−1)` needs both bounds to construct the `Fin (n - 1)` index `i - n`."
  - "The block has `n − 1` positions, matching W's length. At `n = 0` or `n = 1` it is empty and the row is all zeros."
quiz:
  - q: "Which positions carry W's entries?"
    type: choice
    choices: ["`[0, n)`", "`[n, 2n−1)`", "`[2n−1, 3n−1)`"]
    answer: 1
    explain: "`if i.1 < n then 0 else if i.1 < 2 * n - 1 then T.W.data ⟨i.1 - n, _⟩ else 0`."
  - q: "What is `step2b T i` for `i ≥ 2n − 1`?"
    type: number
    answer: 0
    explain: "The final `else 0` branch — those positions belong to the X/Y half-sum and half-difference rows."
  - q: "How many non-zero entries does it have?"
    type: choice
    choices: ["`n`", "`n - 1`", "`2n - 1`"]
    answer: 1
    explain: "W has length `n - 1`, and the window `[n, 2n−1)` has exactly that many positions."
---

## Plain English

```
def step2b {n : Nat} (T : TurynType n) : Fin (3 * n - 1) → Int :=
  fun i =>
    if h1 : i.1 < n then 0
    else if h2 : i.1 < 2 * n - 1 then T.W.data ⟨i.1 - n, by omega⟩
    else 0
```

Row `b`: W, offset by `n` so that it sits immediately after Z's block and before the block shared
by the two halves of X and Y.

`aperiodicAutocorr_step2b` proves this row's autocorrelations are W's, by the same zero-padding
argument as [step2a](#/node/step2a) — with an offset this time, which is what makes
`aperiodicAutocorr_of_support` take a shift parameter.
