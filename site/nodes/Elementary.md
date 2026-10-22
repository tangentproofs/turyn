---
id: Elementary
title: "The ten elementary moves"
summary: "`Elementary n S T` holds when `T` is obtained from `S` by one of ten operations: negate one of the four sequences, reverse one of them, alternate all four, or swap X with Y."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It is an `inductive … : TurynType n → TurynType n → Prop` with ten constructors, each of the form `Elementary n S S.doNegX` — so the second argument is always a *specific* quadruple computed from the first. `Elementary` relates `S` to each of ten named results, nothing else."
  - "Each constructor's target is a `TurynType n`, so the vanishing condition has to be re-proved for it. Those proofs are the `vanishing_*` lemmas in `Turyn/BaseSequence.lean`, and they are what makes the moves legal."
  - "The relation is not stated or proved symmetric. Every move happens to be invertible (`negX`, `revX`, `altAll` and `swap` are involutions on the sequences), but the Lean never says so; [Equivalent](#/node/Equivalent) is only the reflexive–transitive closure."
  - "BDKR's T1..T4 are *families* (negate any one, reverse any one); the Lean spells out the ten instances. There is no `negXY`, no simultaneous reversal, and no 'swap Z with W' (the latter would not type-check at different lengths)."
widgets:
  - type: moves
    title: "Press each move and watch the verdict stay green"
    config: { preset: tt6 }
quiz:
  - q: "How many constructors does `Elementary` have?"
    type: number
    answer: 10
    explain: "`negX negY negZ negW revX revY revZ revW altAll swap` — four negations, four reversals, one alternation of all four, one swap."
  - q: "Why is swapping X with Y legal, but swapping X with Z not among the moves?"
    type: choice
    choices: ["an oversight", "X and Y carry weight 1 in [combinedAutocorr](#/node/combinedAutocorr) while Z carries weight 2", "Z has a different length"]
    answer: 1
    explain: "`vanishing_swapXY` holds by `linarith` on the symmetric sum. Exchanging X and Z would change `N_X + N_Y + 2N_Z + 2N_W` unless the autocorrelations happened to agree."
  - q: "What does `altAll` do?"
    type: choice
    choices: ["reverses all four sequences", "multiplies entry `i` (0-indexed) of all four by `(−1)ⁱ`", "negates all four sequences", "rotates the four sequences"]
    answer: 1
    explain: "`Turyn.altSeqFn a = fun i => (if i.1 % 2 = 0 then 1 else -1) * a i`, applied to all four. Its effect on autocorrelations is a factor `(−1)ˢ` on each (`aperiodicAutocorr_altSeqFn`), so the combined sum is still 0."
  - q: "Does the library prove `Elementary n S T → Elementary n T S`?"
    type: choice
    choices: ["yes", "no — symmetry is never stated"]
    answer: 1
    explain: "Only `Elementary.toEquivalent` and `equivalent_trans` are proved. This is why the conclusion of [canonical_representative_exists](#/node/canonical_representative_exists) should be read as 'reachable from', not 'in the same equivalence class as'."
  - q: "Is `negW` a move?"
    type: choice
    choices: ["yes", "no, only X, Y and Z can be negated"]
    answer: 0
    explain: "All four sequences can be negated individually: `vanishing_negX … vanishing_negW` each follow from `aperiodicAutocorr_negSeqFn`, which says negating a sequence does not change any of its autocorrelations."
---

## Plain English

Turyn-type quadruples are never alone. Ten operations turn one into another:

| move | what it does | why it is harmless |
|---|---|---|
| `negX`, `negY`, `negZ`, `negW` | flip every sign in one sequence | `N_{−a}(s) = N_a(s)`: each product gains two minus signs |
| `revX`, `revY`, `revZ`, `revW` | read one sequence backwards | `N_{reverse a}(s) = N_a(s)`: the same products, in the opposite order |
| `altAll` | multiply entry `i` of all four by `(−1)ⁱ` | each `N` is multiplied by `(−1)ˢ`, so the combined sum scales by `(−1)ˢ` and stays 0 |
| `swap` | exchange X and Y | they carry the same weight in the combined sum |

```
inductive Elementary (n : Nat) : TurynType n → TurynType n → Prop where
  | negX (S : TurynType n) : Elementary n S S.doNegX
  …
  | swap (S : TurynType n) : Elementary n S S.doSwap
```

Each `do*` function (`TurynType.doNegX` and friends) rebuilds the whole record, including the
`vanishing` field, using the matching `vanishing_*` lemma. So "negate X" is a total operation on
*valid* quadruples: it cannot produce an invalid one, and the type says as much.

That these ten moves exist is why canonicalization is worth doing. A search program that enumerates
all quadruples would find each solution many times over; normalizing to a representative
([canonical_representative_exists](#/node/canonical_representative_exists)) cuts the count. In the
other direction, it is why a result proved only for `Canonical1` quadruples can still be useful:
`step1_condition1` shows that for **even `n ≥ 2`** some quadruple reachable from yours has those
six endpoint signs. That is a statement about the *normalized* quadruple, though — transferring a
conclusion back to the original one is not something the Lean does. (And for odd `n ≥ 5` there is
no `Canonical1` quadruple at all: that follows from the
[XY law](#/node/Result.xy_interior_antipalindrome) plus `uAt_pm`, but no theorem in the library
draws the conclusion.)

## What is *not* here

No move changes `n`, none mixes the four sequences together, and none is proved to have an
inverse. The last point is a real gap in the formalization rather than a subtlety: see
[Equivalent](#/node/Equivalent).
