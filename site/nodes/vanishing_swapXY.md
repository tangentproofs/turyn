---
id: vanishing_swapXY
title: "vanishing_swapXY: X and Y may be exchanged"
summary: "Swapping the first two sequences preserves the vanishing condition, because they carry the same weight in the combined sum."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Only X with Y. Z and W carry weight 2, and W also has a different length, so no other exchange is available."
  - "The proof is `linarith` after unfolding — the two sides are the same sum of four terms in a different order."
quiz:
  - q: "What makes the swap legal?"
    type: choice
    choices: ["X and Y have equal weight 1 in [combinedAutocorr](#/node/combinedAutocorr)", "X and Y have equal sums", "X and Y are reverses of each other"]
    answer: 0
    explain: "`N_Y + N_X + 2N_Z + 2N_W` is the same number as `N_X + N_Y + 2N_Z + 2N_W`."
  - q: "Is there a corresponding `vanishing_swapZW`?"
    type: choice
    choices: ["yes", "no — the lengths differ (`n` vs `n - 1`), so it would not even type-check"]
    answer: 1
    explain: "And even at equal lengths the weights would match, so the obstruction here is the typing, not the arithmetic."
  - q: "Which canonical rule exists because of this symmetry?"
    type: text
    answer: ["Canonical6", "rule 6", "canonical 6"]
    explain: "[Canonical6](#/node/Canonical6) breaks the X/Y tie, using position 2 and then position `n − 1`."
---

## Plain English

```
lemma vanishing_swapXY {n : Nat} (T : TurynType n) :
    ∀ s, 1 ≤ s → s < n → combinedAutocorr T.Y.data T.X.data T.Z.data T.W.data s = 0
```

The shortest of the legality lemmas. X and Y appear with the same coefficient in
`N_X + N_Y + 2N_Z + 2N_W`, so exchanging them does not change the value — `linarith` closes it
from `T.vanishing`.

It is the `vanishing` field of [TurynType.doSwap](#/node/TurynType.doSwap), and the reason the
normalization needs a final tie-breaking rule ([Canonical6](#/node/Canonical6)).
