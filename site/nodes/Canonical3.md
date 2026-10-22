---
id: Canonical3
title: "Canonical3: Y's first asymmetry points up"
summary: "The same rule as [Canonical2](#/node/Canonical2), applied to `Y` instead of `X`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Word-for-word [Canonical2](#/node/Canonical2) with `yAt` in place of `xAt`. See that node for the quantifier shape and the vacuous-palindrome case."
  - "Establishing it (`step3_condition3`) uses `revY`, which preserves `Canonical1` and `Canonical2` — the latter because reversing Y does not touch X at all."
quiz:
  - q: "Which field does `Canonical3` constrain?"
    type: choice
    choices: ["`X`", "`Y`", "`Z`", "`W`"]
    answer: 1
    explain: "`yAt S i`, `yAt S (n + 1 - i)`."
  - q: "Does enforcing `Canonical3` risk breaking [Canonical2](#/node/Canonical2)?"
    type: choice
    choices: ["yes", "no — `revY` leaves X untouched"]
    answer: 1
    explain: "That independence is why the normalization can be done in sequence: each step spends moves that do not disturb the earlier conditions."
  - q: "If both X and Y are palindromes, which of `Canonical2`, `Canonical3` hold?"
    type: choice
    choices: ["neither", "both, vacuously", "only `Canonical2`"]
    answer: 1
    explain: "Each is an implication whose antecedent (a *first asymmetric index exists*) is never met."
---

## Plain English

```
def Canonical3 (n : Nat) (S : TurynType n) : Prop :=
  ∀ i, 1 ≤ i → i ≤ n →
    (∀ j, 1 ≤ j → j < i → yAt S j = yAt S (n + 1 - j)) →
    yAt S i ≠ yAt S (n + 1 - i) →
    yAt S i = 1
```

Rule (iii) of the BDKR normalization: [Canonical2](#/node/Canonical2) for `Y`. Reversing `Y`
(`revY`) is the move that enforces it, and because that move touches only the `Y` field, the
earlier rules are undisturbed — which is what lets `step3_condition3` carry `Canonical1` and
`Canonical2` forward.

The two rules together say: of the four quadruples you can reach by independently reversing X and
Y, keep the one whose first asymmetry in each is positive.
