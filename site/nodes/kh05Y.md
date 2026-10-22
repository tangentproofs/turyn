---
id: kh05Y
title: "kh05Y: the second Kharaghani–Tayfeh-Rezaie sequence"
summary: "`+-+++++--+-+--+--++--++++-++++---++-`: 36 entries, 21 plus and 15 minus, sum 6."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Transcribed from the 2005 paper; the `native_decide` proof checks that the quadruple works, not that the transcription matches the publication."
quiz:
  - q: "What is `seqSum kh05Y.data`?"
    type: number
    answer: 6
    explain: "21 `+`s minus 15 `-`s. `kh05_sums` gives `0, 6, 8, 5`."
  - q: "Why must this sum be even?"
    type: choice
    choices: ["it need not be", "because the length 36 is even, and a sum of `k` terms of ±1 has the same parity as `k`"]
    answer: 1
    explain: "`sum_of_pm_ones_mod_two` in `Turyn/PmSum.lean`. All three length-36 sums are even and the length-35 one (`w = 5`) is odd."
  - q: "What is `y²` for this sequence in the energy identity?"
    type: number
    answer: 36
    explain: "`6² = 36`, the second term of `0 + 36 + 2·64 + 2·25 = 214`."
---

## Plain English

```
def kh05Y : PmSeq 36 := pm! "+-+++++--+-+--+--++--++++-++++---++-"
```

Sum `6`, so `y² = 36`. Together with `x = 0`, `z = 8`, `w = 5` this gives the energy total
`0 + 36 + 2·64 + 2·25 = 214`, which is `6·36 − 2` as [energy_identity](#/node/energy_identity)
requires. The library checks it computationally as `kh05_energy` as well — belt and braces, since
the general theorem already covers it.

Like [kh05X](#/node/kh05X), it begins `+` and ends `-`.
