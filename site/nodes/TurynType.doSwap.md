---
id: TurynType.doSwap
title: "TurynType.doSwap: the swap move"
summary: "Exchanges X and Y, re-proving the vanishing condition with `vanishing_swapXY`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Only X and Y can be swapped. Z and W carry weight 2 in [combinedAutocorr](#/node/combinedAutocorr) (and W has a different length), so no other exchange is a symmetry."
  - "It is an involution on the sequences, though the library never says so."
quiz:
  - q: "What does the move do?"
    type: choice
    choices: ["swaps X and Y", "swaps Z and W", "swaps X and Z"]
    answer: 0
    explain: "`⟨S.Y, S.X, S.Z, S.W, Turyn.vanishing_swapXY S⟩`."
  - q: "Why is it legal?"
    type: choice
    choices: ["because X and Y have the same length", "because X and Y carry the same weight 1 in the combined sum, so exchanging them does not change it", "because reversal is free"]
    answer: 1
    explain: "`vanishing_swapXY` is proved by `linarith` after unfolding: `N_Y + N_X + 2N_Z + 2N_W` is the same number as `N_X + N_Y + 2N_Z + 2N_W`."
  - q: "Which canonical condition exists to break the symmetry this move creates?"
    type: text
    answer: ["Canonical6", "canonical 6", "Canonical6 n S", "Turyn.Canonical6", "rule 6", "rule (vi)", "6", "vi"]
    explain: "[Canonical6](#/node/Canonical6) compares X and Y at position 2 and, failing that, at `n − 1`."
---

## Plain English

```
def TurynType.doSwap {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.Y, S.X, S.Z, S.W, Turyn.vanishing_swapXY S⟩
```

BDKR's T4. X and Y appear symmetrically in `N_X + N_Y + 2N_Z + 2N_W`, so exchanging them leaves
every lag's value untouched — the proof is one `linarith`.

Because the move always applies, X and Y are interchangeable in any quadruple, and a canonical form
has to pick one of the two orderings. That is the job of [Canonical6](#/node/Canonical6), the last
rule of the normalization.
