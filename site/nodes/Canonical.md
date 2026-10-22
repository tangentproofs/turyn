---
id: Canonical
title: "Canonical: all six BDKR conditions at once"
summary: "`Canonical n S` is the conjunction `Canonical1 n S ∧ … ∧ Canonical6 n S`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The only theorem using it is [canonical_representative_exists](#/node/canonical_representative_exists), which proves a canonical representative is *reachable*. Uniqueness of the canonical form is not formalized, so `Canonical n S` is not known to pick out one quadruple per orbit."
  - "There is no proof that `Canonical` is decidable, and no `Bool` mirror. The conditions quantify over indices with nested implications, so deciding them would need some work (it is finite, but not set up here)."
  - "The [XY law](#/node/Result.xy_interior_antipalindrome) does **not** use this predicate — only [Canonical1](#/node/Canonical1)."
widgets:
  - type: moves
    title: "Normalizing, one move at a time (this widget chases Canonical1 only)"
    config: { preset: kh05 }
quiz:
  - q: "How many conjuncts?"
    type: number
    answer: 6
    explain: "`Canonical1 n S ∧ Canonical2 n S ∧ Canonical3 n S ∧ Canonical4 n S ∧ Canonical5 n S ∧ Canonical6 n S`."
  - q: "Which theorem uses `Canonical`?"
    type: choice
    choices: ["[Result.xy_interior_antipalindrome](#/node/Result.xy_interior_antipalindrome)", "[canonical_representative_exists](#/node/canonical_representative_exists)", "[energy_identity](#/node/energy_identity)", "none"]
    answer: 1
    explain: "It is the conclusion's second half: `∃ T, Equivalent n S T ∧ Canonical n T`. The XY law assumes only `Canonical1`."
  - q: "Does the library prove that each orbit contains exactly one canonical quadruple?"
    type: choice
    choices: ["yes", "no — only that at least one is reachable"]
    answer: 1
    explain: "The docstring of `canonical_representative_exists` says 'uniqueness within the orbit is not yet formalized', and the Lean bears that out."
  - q: "Is `Canonical` a `Prop` or a `Bool`?"
    type: choice
    choices: ["a `Prop`, with no decidability instance in the library", "a `Bool`", "a `Prop` with a `Decidable` instance"]
    answer: 0
    explain: "Unlike [IsTurynType](#/node/IsTurynType), which has `isTurynTypeBool` and a `Decidable` instance, nothing computational is provided for the canonical conditions."
---

## Plain English

```
def Canonical (n : Nat) (S : TurynType n) : Prop :=
  Canonical1 n S ∧ Canonical2 n S ∧ Canonical3 n S ∧
  Canonical4 n S ∧ Canonical5 n S ∧ Canonical6 n S
```

A cascade of tie-breakers, taken from Best–Đoković–Kharaghani–Ramp (arXiv:1206.4107). Each one
eliminates the freedom left by the previous ones:

| rule | what it fixes | which move it spends |
|---|---|---|
| [1](#/node/Canonical1) | the six endpoint signs are `+1` | `negX`, `negY`, `negZ`, `negW`, `altAll` |
| [2](#/node/Canonical2) | the first place X disagrees with its reverse is `+1` | `revX` |
| [3](#/node/Canonical3) | the same for Y | `revY` |
| [4](#/node/Canonical4) | the first place Z *agrees* with its reverse is `+1` | `revZ` (with `negZ`) |
| [5](#/node/Canonical5) | the first exceptional index of W is `+1` | `revW` (with `negW`) |
| [6](#/node/Canonical6) | which of X, Y is which | `swap` |

Rules 2–5 all have the same shape: *at the first index where some symmetry test fails, the entry
is `+1`*, written in Lean as an implication chain (`if all earlier indices pass, and this one
fails, then the entry is 1`). Rule 6 is a disjunction with an escape clause for `n ≤ 2`.

Each `step*_condition*` lemma applies a move or two, re-proves the earlier rules for the result,
and adds one more; [canonical_representative_exists](#/node/canonical_representative_exists)
chains all six.
