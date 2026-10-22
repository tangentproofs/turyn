---
id: kh05W
title: "kh05W: the short Kharaghani–Tayfeh-Rezaie sequence"
summary: "`+++-+-----++--+-+++--+-+-+++-++++-+`: 35 entries — one fewer than the others — with sum 5."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Transcribed from the 2005 paper."
  - "Its type is written `PmSeq 35`; `PmSeq (36 - 1)` is the same type."
quiz:
  - q: "How many entries?"
    type: number
    answer: 35
    explain: "One fewer than X, Y, Z: the shape `(n, n, n, n − 1)` with `n = 36`."
  - q: "What is `seqSum kh05W.data`?"
    type: number
    answer: 5
    explain: "20 `+`s and 15 `-`s. Odd, as it must be for an odd length (`sum_of_pm_ones_odd_iff`)."
  - q: "What is `aperiodicAutocorr kh05W.data 35`?"
    type: number
    answer: 0
    explain: "The length is 35, so the guard `if s ≥ n then 0` fires at `s = 35`. That is the top lag the vanishing condition checks, and there W contributes nothing — the equation becomes `x₁x₃₆ + y₁y₃₆ + 2z₁z₃₆ = 0`."
---

## Plain English

```
def kh05W : PmSeq 35 := pm! "+++-+-----++--+-+++--+-+-+++-++++-+"
```

Sum `5`, contributing `2w² = 50` to the energy total `0 + 36 + 128 + 50 = 214`.

Of the 35 lags that [kharaghani_2005_tt36](#/node/kharaghani_2005_tt36) checks, the last one —
`s = 35` — is the only one where W drops out *by definition*: the shifted copy has slid clear of a
length-35 sequence, so [aperiodicAutocorr](#/node/aperiodicAutocorr)'s guard `if s ≥ n then 0`
fires. (`N_W(s)` also happens to come out `0` at `s = 17, 27, 29, 31, 33` for this particular
sequence, but there the sum is a genuine sum of products that cancels.)
