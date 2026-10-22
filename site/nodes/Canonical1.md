---
id: Canonical1
title: "Canonical1: the six endpoint signs"
summary: "`Canonical1 n S` asks that `xAt S 1`, `xAt S n`, `yAt S 1`, `yAt S n`, `zAt S 1` and `wAt S 1` all equal `1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**Six conditions, not eight.** `zAt S n` and `wAt S (n-1)` are *not* asked to be `+1`. For `zAt S n` that would be contradictory: under `Canonical1` with `n ≥ 2` the vanishing condition at lag `n − 1` forces `zAt S n = -1` (`lemma1_endpoint_constraint`)."
  - "**Unsatisfiable at `n ≤ 1`.** `wAt S 1` reads position 0 of a sequence of length `n - 1`; at `n = 1` that is out of range and [lookupNat](#/node/lookupNat) returns `0`, so the last conjunct fails for every `S`. At `n = 0` both `xAt S 1` and `xAt S n` fail too."
  - "At `n = 1`, note also that `xAt S 1` and `xAt S n` are the *same* conjunct repeated."
  - "This is the only canonical condition referenced by `Challenge.lean`, and the only one the [XY law](#/node/Result.xy_interior_antipalindrome) assumes. The other five live in `Turyn/Equivalence.lean`."
widgets:
  - type: moves
    title: "The six cells Canonical1 reads, and the moves that fix them"
    config: { preset: tt6 }
quiz:
  - q: "How many equations does `Canonical1 n S` contain?"
    type: number
    answer: 6
    explain: "`xAt S 1 = 1 ∧ xAt S n = 1 ∧ yAt S 1 = 1 ∧ yAt S n = 1 ∧ zAt S 1 = 1 ∧ wAt S 1 = 1`."
  - q: "Does `Canonical1` constrain `zAt S n`?"
    type: choice
    choices: ["yes, to `+1`", "yes, to `-1`", "no — but the vanishing condition then forces it to `-1` anyway"]
    answer: 2
    explain: "`Canonical1` says nothing about `zAt S n`. `lemma1_endpoint_constraint` derives `zAt S n = -1` from `Canonical1` plus `S.vanishing` at lag `n − 1`, for `n ≥ 2`."
  - q: "Is there a `Canonical1 1 S` for some `S : TurynType 1`?"
    type: choice
    choices: ["yes", "no — `wAt S 1 = 0` for every `S`, because `W` is empty at `n = 1`"]
    answer: 1
    explain: "`W : PmSeq (1 - 1) = PmSeq 0`. The accessor returns the out-of-range default, so the sixth conjunct is `0 = 1`."
  - q: "Is [TT(6)](#/node/tt6_valid) `Canonical1`?"
    type: choice
    choices: ["yes", "no — `tt6X` starts with `-`"]
    answer: 1
    explain: "`tt6X = pm! \"----+-\"`, so `xAt 1 = -1`. Negating all four sequences — four `Elementary` moves — produces an [Equivalent](#/node/Equivalent) quadruple that is `Canonical1`."
  - q: "Which of these moves *always* preserves `xAt S 1`?"
    type: choice
    choices: ["`negX`", "`revX`", "`altAll`", "`swap`"]
    answer: 2
    explain: "`altAll` multiplies entry `i` (0-indexed) by `(−1)ⁱ`, so position 1 is multiplied by `(−1)⁰ = 1`. For even `n` it flips position `n` while leaving position 1 alone, which is exactly how step 1 of the normalization fixes the far end."
---

## Plain English

The first and simplest normalization: make the ends positive.

```
def Canonical1 (n : Nat) (S : TurynType n) : Prop :=
  xAt S 1 = 1 ∧ xAt S n = 1 ∧
  yAt S 1 = 1 ∧ yAt S n = 1 ∧
  zAt S 1 = 1 ∧ wAt S 1 = 1
```

Six of the eight "endpoint" entries. Why these six?

- `x₁`, `y₁`, `z₁`, `w₁` can each be flipped independently by negating that one sequence
  (`negX`, `negY`, `negZ`, `negW`).
- `xₙ` and `yₙ` cannot be flipped independently — but they do not need to be. The vanishing
  condition at lag `n − 1` reads `x₁xₙ + y₁yₙ + 2z₁zₙ = 0`, and for ±1 values with `x₁ = y₁ = z₁ = 1`
  the only solutions are `(xₙ, yₙ, zₙ) = (1, 1, −1)` and `(−1, −1, 1)`. So `xₙ` and `yₙ` are
  *always equal*, and if they are both `−1`, one `altAll` move (legal when `n` is even) flips both
  while leaving the four first entries alone.
- `zₙ` is then determined, not chosen: `zₙ = −1` necessarily. (`w_{n−1}` is neither determined
  by this argument nor normalized by rule (1); it is [Canonical5](#/node/Canonical5)'s business.)

That argument is `step1_condition1` in `Turyn/Equivalence.lean`, and it is where the `n` even
hypothesis of [canonical_representative_exists](#/node/canonical_representative_exists) comes
from.

## Why it is the only one in the challenge

`Challenge.lean` mentions `Canonical1` and no other canonical rule, because the
[XY law](#/node/Result.xy_interior_antipalindrome) needs exactly this much: the proof's modulo-4
bookkeeping uses `uAt S 1 = 1` and `uAt S n = 1`, and nothing about the symmetry comparisons in
[Canonical2](#/node/Canonical2) … [Canonical6](#/node/Canonical6). Docstrings that say "a canonical
Turyn sequence" are therefore slightly stronger than the Lean.
