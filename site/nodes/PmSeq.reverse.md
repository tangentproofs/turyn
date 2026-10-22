---
id: PmSeq.reverse
title: "PmSeq.reverse: reversal, bundled"
summary: "`s.reverse` reads the sequence backwards, packaged with the proof that ±1-ness survives."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Carrier is [reverseFn](#/node/reverseFn) `s.data`, i.e. `fun i => s.data ⟨n - 1 - i.1, _⟩`; proof field is `AllPmOne_reverseFn s.pm`, which holds because every entry of the result is an entry of the original."
quiz:
  - q: "What is entry `i` of `s.reverse`?"
    type: choice
    choices: ["`s.data i`", "`s.data ⟨n - 1 - i.1, _⟩`", "`-(s.data i)`"]
    answer: 1
    explain: "That is [reverseFn](#/node/reverseFn), built on [revFin](#/node/revFin)."
  - q: "Does reversing change any autocorrelation?"
    type: choice
    choices: ["no — `aperiodicAutocorr_reverseFn`", "yes", "only the lag-1 one"]
    answer: 0
    explain: "The products at lag `s` are the same set of pairs, enumerated from the other end."
  - q: "For which sequence is `reverse` the identity, in the TT(6) example?"
    type: text
    answer: ["W", "tt6W", "W, since -+++- is a palindrome"]
    explain: "[tt6W](#/node/tt6W) `= -+++-` is a palindrome, so `revW` leaves that quadruple unchanged."
---

## Plain English

```
def PmSeq.reverse {n : Nat} (s : PmSeq n) : PmSeq n :=
  ⟨reverseFn s.data, AllPmOne_reverseFn s.pm⟩
```

[reverseFn](#/node/reverseFn) lifted to [PmSeq](#/node/PmSeq). Used by the four `revX … revW`
[moves](#/node/Elementary), and — because reversal leaves autocorrelations alone — free to apply
whenever a canonical rule wants to compare a sequence with its mirror image
([Canonical2](#/node/Canonical2) and friends).
