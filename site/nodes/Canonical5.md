---
id: Canonical5
title: "Canonical5: W's first exceptional index points up"
summary: "At the first 1-indexed position `i` where `wᵢ · w_{n−i}` differs from `w_{n−1}`, the entry `wᵢ` must be `+1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The mirror index is `n - i`, not `n + 1 - i`, because `W` has length `n - 1`: position `i` pairs with position `(n - 1) + 1 - i = n - i`. The reference value is `wAt S (n - 1)`, W's last entry."
  - "The range is `1 ≤ i ≤ n - 1`, matching W's length."
  - "The test compares a *product* against a reference entry rather than comparing two entries directly. Negating W leaves every product `wᵢ · w_{n−i}` unchanged (two sign flips) while flipping the reference `w_{n−1}`, so the trigger is sensitive to `negW` in a controlled way; reversing W permutes the products. That is the handle `step5_condition5` uses."
quiz:
  - q: "What is the mirror index of `i` inside `W`?"
    type: choice
    choices: ["`n + 1 - i`", "`n - i`", "`n - 1 - i`"]
    answer: 1
    explain: "`W` has length `n - 1`, so the 1-indexed mirror of `i` is `(n - 1) + 1 - i = n - i`. [Canonical5](#/node/Canonical5) writes `wAt S i * wAt S (n - i)`."
  - q: "What is the reference value the product is compared with?"
    type: choice
    choices: ["`1`", "`wAt S 1`", "`wAt S (n - 1)`", "`0`"]
    answer: 2
    explain: "`wAt S i * wAt S (n - i) ≠ wAt S (n - 1)` is the trigger. `wAt S (n - 1)` is W's last entry."
  - q: "What is the valid range for `i`?"
    type: choice
    choices: ["`1 ≤ i ≤ n`", "`1 ≤ i ≤ n - 1`", "`2 ≤ i ≤ n - 1`"]
    answer: 1
    explain: "`∀ i, 1 ≤ i → i ≤ n - 1 → …`, i.e. the positions W actually has."
---

## Plain English

```
def Canonical5 (n : Nat) (S : TurynType n) : Prop :=
  ∀ i, 1 ≤ i → i ≤ n - 1 →
    (∀ j, 1 ≤ j → j < i → wAt S j * wAt S (n - j) = wAt S (n - 1)) →
    wAt S i * wAt S (n - i) ≠ wAt S (n - 1) →
    wAt S i = 1
```

Rule (v), the W analogue of rules (ii)–(iv), with two differences forced by W's shorter length and
by which moves are available.

- **The mirror index is `n − i`.** W has `n − 1` entries, so 1-indexed position `i` mirrors to
  `(n − 1) + 1 − i = n − i`.
- **The test is on the product `wᵢ · w_{n−i}` against the reference `w_{n−1}`.** Using a product
  rather than comparing two entries is what makes the scan survive the available moves: `negW`
  flips every entry, so it leaves each product `wᵢ · w_{n−i}` alone but flips the reference
  `w_{n−1}`, while `revW` reverses the order, which permutes the products and moves the reference.
  The step lemma `step5_condition5` works out which combination of `revW` and `negW` to apply, and
  the helpers `doRevW_product_eq` and `doNegRevW_product_eq` record how the products transform.

As with the other scan rules, if no exceptional index exists the condition is vacuous.
