---
id: turyn_vanishing_total
title: "The lag table of a TT(n) sums to zero"
summary: "For any [TurynType n](#/node/TurynType), `weightedTotalAutocorr` of its four sequences is `0`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is strictly weaker than the vanishing condition it comes from: every term is 0, so of course the sum is. The only reason it has a name is that the [energy identity](#/node/energy_identity) needs the *sum*, not the individual terms."
  - "No hypothesis on `n`. At `n = 0` and `n = 1` the sum is empty and the statement is trivially true."
quiz:
  - q: "How is it proved?"
    type: choice
    choices: ["by induction on `n`", "by `Finset.sum_eq_zero`, since every summand is `T.vanishing` at that lag", "by `native_decide`", "by the energy identity"]
    answer: 1
    explain: "`exact sum_eq_zero (fun i hi => T.vanishing (i + 1) (by omega) …)`. One line."
  - q: "Does the converse hold — does a zero total imply the quadruple is Turyn-type?"
    type: choice
    choices: ["yes", "no, and the library does not claim it"]
    answer: 1
    explain: "A sum of integers can vanish without each term vanishing. Only this direction is stated."
  - q: "Which hypothesis on `n` does it need?"
    type: choice
    choices: ["`n ≥ 1`", "`n` even", "none"]
    answer: 2
    explain: "`theorem turyn_vanishing_total {n : Nat} (T : TurynType n)`. At small `n` the sum is empty, which is still `0`."
---

## Plain English

```
theorem turyn_vanishing_total {n : Nat} (T : TurynType n) :
    weightedTotalAutocorr T.X.data T.Y.data T.Z.data T.W.data = 0
```

Being Turyn-type means every entry of the lag table is zero. Adding up a column of zeros gives
zero. That is the whole proof:

```
unfold weightedTotalAutocorr
exact sum_eq_zero (fun i hi => T.vanishing (i + 1) (by omega) (by … omega))
```

It earns a name because of how the [energy identity](#/node/energy_identity) is organized. That
proof expands four squares, each producing a `totalAutocorr` term, and then needs the *weighted
sum* of those four totals to vanish. Reaching that from `T.vanishing` takes two steps: re-order the
double sum ([weightedTotalAutocorr_decompose](#/node/weightedTotalAutocorr_decompose)) and then
apply this lemma.
