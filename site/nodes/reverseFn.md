---
id: reverseFn
title: "reverseFn: read a sequence backwards"
summary: "`reverseFn a i = a ⟨n - 1 - i.1, _⟩` — the sequence with its entries in the opposite order."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Index arithmetic is `Nat` subtraction, but the bound `i.1 < n` keeps `n - 1 - i.1` in range. It is the same index map as [revFin](#/node/revFin), but written out here: the two are independent definitions in different files, and neither is defined in terms of the other."
  - "`lookupNat_reverseFn` needs the hypothesis `i < n` to relate it to [lookupNat](#/node/lookupNat) — out of range both sides are 0 but the stated form assumes in-range."
quiz:
  - q: "What is entry `0` of `reverseFn a`?"
    type: choice
    choices: ["`a 0`", "`a (n - 1)` — the last entry of `a`", "`0`"]
    answer: 1
    explain: "`n - 1 - 0 = n - 1`."
  - q: "What is `aperiodicAutocorr (reverseFn a) s`?"
    type: choice
    choices: ["`aperiodicAutocorr a s`", "`aperiodicAutocorr a (n - s)`", "`-(aperiodicAutocorr a s)`"]
    answer: 0
    explain: "`aperiodicAutocorr_reverseFn`: at lag `s` the same pairs `(i, i+s)` occur, just visited in the opposite order."
  - q: "Is `reverseFn` an involution?"
    type: choice
    choices: ["yes, mathematically — and [revFin](#/node/revFin) is proved involutive", "no"]
    answer: 0
    explain: "`revFin_involutive` is proved for the index map `revFin` (a separate definition with the same formula); no corresponding statement about `reverseFn` or `PmSeq.reverse` is made anywhere, which is part of why [Equivalent](#/node/Equivalent) is never shown symmetric."
---

## Plain English

```
def reverseFn {n : Nat} (a : Fin n → Int) : Fin n → Int :=
  fun i => a ⟨n - 1 - i.1, by have := i.2; omega⟩
```

Sequence reversal. Its one important property is `aperiodicAutocorr_reverseFn`: reversal changes
no autocorrelation, because at each lag it produces the same products in a different order. That is
why `revX … revW` are legal [Elementary](#/node/Elementary) moves and why the canonical rules
[Canonical2](#/node/Canonical2)–[Canonical5](#/node/Canonical5) can use reversal to fix signs.
