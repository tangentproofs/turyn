---
id: Canonical4
title: "Canonical4: Z's first symmetry points up"
summary: "At the first 1-indexed position where `Z` *agrees* with its mirror image, the entry must be `+1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The test is inverted relative to [Canonical2](#/node/Canonical2): the earlier indices must *disagree* with their mirrors (`zⱼ ≠ z_{n+1−j}`) and the index in question must *agree*. That is because Z is normalized by negate-and-reverse, which flips the entry at exactly the agreeing positions and leaves the disagreeing ones alone (`zAt_doNegRevZ`)."
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
    choices: ["a typo in the Lean", "because Z is normalized by negating *and* reversing, which changes the entry at exactly the positions that agree with their mirror", "because Z carries weight 2"]
    answer: 1
    explain: "`zAt_doNegRevZ` gives `zAt S.doRevZ.doNegZ j = -(zAt S (n + 1 - j))`. So negate-and-reverse leaves the pattern of which positions agree with their mirror exactly as it was, and flips the entry at precisely the agreeing positions — which is why the scan looks for the first *agreeing* index. `step4_condition4` is the step that uses it."
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

The reason for the flip is the move used. Z is normalized by negate-and-reverse (`S.doRevZ.doNegZ`,
so `revZ` then `negZ`): the new Z has `z'ᵢ = −z_{n+1−i}` (`zAt_doNegRevZ`). Work out what that does
to the two kinds of position:

- where the original *agreed* with its mirror (`zᵢ = z_{n+1−i}`), the new entry is `z'ᵢ = −zᵢ`;
- where it *disagreed* (`z_{n+1−i} = −zᵢ`), the new entry is `z'ᵢ = zᵢ` — unchanged.

So the pattern of agreements is itself untouched by the move, and what the move toggles is the
entry at exactly the agreeing positions. Those are therefore the ones worth scanning for, and the
disagreeing positions have to be skipped over — which is what the first inner hypothesis does.
