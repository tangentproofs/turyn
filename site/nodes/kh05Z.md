---
id: kh05Z
title: "kh05Z: the third Kharaghani–Tayfeh-Rezaie sequence"
summary: "`+-+++++-+--++++-+++-++--+++-+--+---+`: 36 entries, 22 plus and 14 minus, sum 8."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Transcribed from the 2005 paper."
  - "Z carries weight 2 both in [combinedAutocorr](#/node/combinedAutocorr) and in the energy identity, where its contribution is `2z² = 128` — the largest of the four."
quiz:
  - q: "What is `seqSum kh05Z.data`?"
    type: number
    answer: 8
    explain: "22 `+`s and 14 `-`s. `kh05_sums` gives `0, 6, 8, 5`."
  - q: "What does `2z²` contribute to the energy total?"
    type: number
    answer: 128
    explain: "`2 · 8² = 128`. The full sum is `0 + 36 + 128 + 50 = 214 = 6·36 − 2`."
  - q: "What is `zAt S 36` for this quadruple?"
    type: number
    answer: 1
    explain: "The literal ends with `+`. That is consistent with the endpoint relation: with `x₁ = y₁ = z₁ = +1` and `x₃₆ = y₃₆ = −1`, we need `2z₁z₃₆ = 2`, so `z₃₆ = +1`."
---

## Plain English

```
def kh05Z : PmSeq 36 := pm! "+-+++++-+--++++-+++-++--+++-+--+---+"
```

Sum `8`, the largest of the four, and it is weighted: the energy identity's `2z²` term is `128` out
of the total `214`.

Z is also the sequence that heads both base sequences and the T-sequence — see
[step1](#/node/step1) and [step2](#/node/step2) — so in the final 428 × 428 matrix the first 36
positions of each of the four combined vectors come from this sequence.
