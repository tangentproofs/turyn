---
id: Canonical4
title: "Canonical4: Z's first symmetry points up"
summary: "At the first 1-indexed position where `Z` *agrees* with its mirror image, the entry must be `+1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The test is inverted relative to [Canonical2](#/node/Canonical2): the earlier indices must *disagree* with their mirrors (`zⱼ ≠ z_{n+1−j}`) and the index in question must *agree*. That is because Z is normalized by negate-and-reverse, which turns agreement into disagreement."
  - "Vacuous when Z disagrees with its mirror everywhere — an 'anti-palindrome'."
  - "It constrains Z's first entry only through [Canonical1](#/node/Canonical1); nothing here mentions `zAt S n`, which is already forced to `-1`."
quiz:
  - q: "Which comparison triggers the condition at index `i`?"
    type: choice
    choices: ["`zAt S i ≠ zAt S (n + 1 - i)`", "`zAt S i = zAt S (n + 1 - i)`", "`zAt S i = 1`"]
    answer: 1
    explain: "`(∀ j < i, zAt S j ≠ zAt S (n + 1 - j)) → zAt S i = zAt S (n + 1 - i) → zAt S i = 1`. The first *symmetric* index, not the first asymmetric one."
  - q: "Why is the test inverted compared with [Canonical2](#/node/Canonical2)?"
    type: choice
    choices: ["a typo in the Lean", "because Z is normalized by negating *and* reversing, which flips the symmetry test", "because Z carries weight 2"]
    answer: 1
    explain: "Reversing alone would compare `zᵢ` with `z_{n+1−i}`; negating as well turns 'equal' into 'opposite'. The helper lemma is `zAt_doNegRevZ`, and `step4_condition4` is the step that uses it."
  - q: "If `zAt S i ≠ zAt S (n + 1 - i)` for every `i`, does `Canonical4` hold?"
    type: choice
    choices: ["yes, vacuously", "no"]
    answer: 0
    explain: "The second hypothesis is never satisfied."
---

## Plain English

```
def Canonical4 (n : Nat) (S : TurynType n) : Prop :=
  ∀ i, 1 ≤ i → i ≤ n →
    (∀ j, 1 ≤ j → j < i → zAt S j ≠ zAt S (n + 1 - j)) →
    zAt S i = zAt S (n + 1 - i) →
    zAt S i = 1
```

Rule (iv). Same idea as [Canonical2](#/node/Canonical2), but reading the mirror test the other way
round: scan from the left until you hit a position that *matches* its mirror, and require that
entry to be `+1`.

The reason for the flip is the move used. Z is normalized by negate-and-reverse (`negZ` then
`revZ`): the reversed-and-negated Z has `z'ᵢ = −z_{n+1−i}`, so where the original had
`zᵢ = z_{n+1−i}` the new one has `z'ᵢ = −zᵢ`. Agreement is the invariant that move can toggle.
Positions that disagree with their mirror are unaffected, so the scan has to skip over them —
which is exactly what the first inner hypothesis does.
