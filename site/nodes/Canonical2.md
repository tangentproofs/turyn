---
id: Canonical2
title: "Canonical2: X's first asymmetry points up"
summary: "At the first 1-indexed position where `X` differs from its mirror image, the entry must be `+1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The quantifier shape matters: it is `∀ i, 1 ≤ i → i ≤ n → (∀ j < i, xⱼ = x_{n+1−j}) → xᵢ ≠ x_{n+1−i} → xᵢ = 1`. The two inner hypotheses say 'i is the first asymmetric index'. If X is a palindrome, no `i` satisfies them and the condition holds vacuously."
  - "Nothing here says X is *not* a palindrome. The condition is about what happens at the first asymmetry if there is one."
  - "`n + 1 - i` is `Nat` subtraction, but on the range `1 ≤ i ≤ n` it is the honest mirror index."
quiz:
  - q: "If `X` is a palindrome (`xᵢ = x_{n+1−i}` for every `i`), does `Canonical2 n S` hold?"
    type: choice
    choices: ["yes, vacuously", "no", "only if `n` is even"]
    answer: 0
    explain: "The hypothesis `xAt S i ≠ xAt S (n + 1 - i)` is never satisfied, so the implication is vacuously true for every `i`."
  - q: "Which move is used to establish `Canonical2` in `step2_condition2`?"
    type: choice
    choices: ["`negX`", "`revX`", "`altAll`", "`swap`"]
    answer: 1
    explain: "Reversing X swaps `xᵢ` with `x_{n+1−i}`, so at the first asymmetric index the sign flips. Note `revX` leaves the *set* of asymmetric indices alone, so the earlier conditions survive — and reversal does not change any autocorrelation (`aperiodicAutocorr_reverseFn`)."
  - q: "Could `Canonical2` conflict with [Canonical1](#/node/Canonical1)?"
    type: choice
    choices: ["yes, that is why normalization can fail", "no — `revX` preserves `Canonical1` when `x₁ = xₙ`, which `Canonical1` guarantees"]
    answer: 1
    explain: "`canonical1_doRevX` proves exactly that, for `2 ≤ n`. Reversal exchanges `x₁` with `xₙ`, and `Canonical1` has already made them both `+1`."
---

## Plain English

Rule (ii) of the BDKR normalization. Compare `X` with `X` read backwards. Either they agree
everywhere (X is a palindrome) or there is a first position `i` where they differ. In the second
case, the rule demands that `xᵢ = +1` — so of the two quadruples related by reversing X, we keep
the one whose first asymmetry is positive.

```
def Canonical2 (n : Nat) (S : TurynType n) : Prop :=
  ∀ i, 1 ≤ i → i ≤ n →
    (∀ j, 1 ≤ j → j < i → xAt S j = xAt S (n + 1 - j)) →
    xAt S i ≠ xAt S (n + 1 - i) →
    xAt S i = 1
```

Read the two inner hypotheses as the definition of "first": every earlier position agrees with its
mirror, and this one does not. The whole statement is then "whenever `i` is the first asymmetric
index, `xᵢ = 1`" — which, since there is at most one such `i`, is one equation at most.

`revX` is the move that enforces it, and it is safe to use: reversing a sequence changes none of
its autocorrelations (`aperiodicAutocorr_reverseFn`), and it preserves
[Canonical1](#/node/Canonical1) because that rule has already made `x₁` and `xₙ` both `+1`.
