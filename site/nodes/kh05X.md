---
id: kh05X
title: "kh05X: the first Kharaghani–Tayfeh-Rezaie sequence"
summary: "`+++----++-+-+-----++++-++-++++----+-`: 36 entries, 18 of each sign, so its sum is 0."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is a transcription of published data. That the four sequences work is [proved](#/node/kharaghani_2005_tt36) by `native_decide`; that they are the same sequences as in the 2005 paper is a matter of transcription, which no theorem can check."
  - "`pm!` discharges the length (36) and the ±1 condition with `decide` at elaboration time. Only the vanishing condition needs `native_decide`."
quiz:
  - q: "What is `seqSum kh05X.data`?"
    type: number
    answer: 0
    explain: "18 `+`s and 18 `-`s. `kh05_sums` records `0, 6, 8, 5` for X, Y, Z, W."
  - q: "What is the type of `kh05X`?"
    type: text
    answer: ["PmSeq 36", "Turyn.PmSeq 36", "PmSeq (36)", "a PmSeq 36"]
    explain: "`def kh05X : PmSeq 36 := pm! \"+++----++-+-+-----++++-++-++++----+-\"` — 36 characters."
  - q: "Is `xAt S 36 = 1` for this quadruple (i.e. does [Canonical1](#/node/Canonical1) hold)?"
    type: choice
    choices: ["yes", "no — the last character is `-`"]
    answer: 1
    explain: "`kh05X` starts `+` and ends `-`, and `kh05Y` does too. One `altAll` move flips both last entries (legal since 36 is even) and leaves the first entries alone, which makes the quadruple `Canonical1`."
---

## Plain English

```
def kh05X : PmSeq 36 := pm! "+++----++-+-+-----++++-++-++++----+-"
```

The X of the quadruple that settled Hadamard order 428. Balanced: 18 pluses and 18 minuses, so
`x = 0`, and the [energy identity](#/node/energy_identity) at `n = 36` becomes
`0 + 36 + 2·64 + 2·25 = 214 = 6·36 − 2`.

A detail worth noticing: `x₁ = +1` but `x₃₆ = −1`, and the same for
[kh05Y](#/node/kh05Y). The two must agree, by the endpoint relation
`x₁x₃₆ + y₁y₃₆ + 2z₁z₃₆ = 0` (here `−1 − 1 + 2 = 0`, with `z₃₆ = +1`). One
[altAll](#/node/Elementary) move flips both and makes the quadruple
[Canonical1](#/node/Canonical1).
