---
id: step2a
title: "step2a: Z in the first n positions"
summary: "The first row of the T-sequence: `Z` on positions `[0, n)` of a length-`3n − 1` window, and `0` everywhere else."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A bare `Fin (3 * n - 1) → Int`, not a [SignSeq](#/node/SignSeq); [step2](#/node/step2) wraps it with the proof `step2a_sign`."
  - "The `if h : i.1 < n` is a dependent `if`, because the proof `h` is needed to build the `Fin n` index into `Z`."
quiz:
  - q: "What is `step2a T i` for `i = n`?"
    type: number
    answer: 0
    explain: "`if h : i.1 < n then T.Z.data ⟨i.1, h⟩ else 0`, and `n < n` is false."
  - q: "How many non-zero entries does it have (for `n ≥ 1`)?"
    type: choice
    choices: ["`n`", "`n - 1`", "`3n - 1`"]
    answer: 0
    explain: "One per entry of Z, all of which are ±1."
  - q: "How does its aperiodic autocorrelation compare with Z's?"
    type: choice
    choices: ["they are equal at every lag", "it is `2 ×` Z's", "it is 0"]
    answer: 0
    explain: "`aperiodicAutocorr_step2a : aperiodicAutocorr (step2a T) s = aperiodicAutocorr T.Z.data s`. Zero-padding adds only zero products."
---

## Plain English

```
def step2a {n : Nat} (T : TurynType n) : Fin (3 * n - 1) → Int :=
  fun i => if h : i.1 < n then T.Z.data ⟨i.1, h⟩ else 0
```

Row `a` of the T-sequence: copy Z into the first `n` of the `3n − 1` positions and pad with zeros.

The padding is free as far as autocorrelations go — every extra product involves a zero — so
`aperiodicAutocorr_step2a` says this row has exactly Z's autocorrelations at every lag. See
[step2](#/node/step2) for how the four rows fit together.
