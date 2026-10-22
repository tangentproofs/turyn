---
id: tt6Z
title: "tt6Z = --+-++"
summary: "The third sequence of the worked TT(6) example: three `+1`s and three `-1`s, so its sum is 0."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Z carries weight 2 in [combinedAutocorr](#/node/combinedAutocorr), so its autocorrelations count double in the vanishing condition."
  - "Same `pm!` machinery as [tt6X](#/node/tt6X)."
quiz:
  - q: "What is `seqSum tt6Z.data`?"
    type: number
    answer: 0
    explain: "Three `+1`s, three `-1`s. Recorded in `tt6_sums`."
  - q: "What is `zAt S 6` for this quadruple?"
    type: number
    answer: 1
    explain: "`--+-++` ends with `+`. Note that after normalizing to [Canonical1](#/node/Canonical1) — which here means negating all four — this entry becomes `-1`, as `lemma1_endpoint_constraint` requires."
  - q: "In the pipeline, where do Z's entries end up?"
    type: choice
    choices: ["positions `[0, n)` of the T-sequence", "positions `[n, 2n−1)`", "positions `[2n−1, 3n−1)`", "they are discarded"]
    answer: 0
    explain: "`step2a T` puts Z in the first `n` positions of the length-`3n − 1` T-sequence and zero elsewhere. W follows in `[n, 2n−1)`, and the half-sum and half-difference of X and Y share `[2n−1, 3n−1)`."
---

## Plain English

```
def tt6Z : PmSeq 6 := pm! "--+-++"
```

Entries: `(-1, -1, 1, -1, 1, 1)`. Sum `0`, which is why the `2z²` term of the
[energy identity](#/node/energy_identity) contributes nothing for this example:
`16 + 16 + 2·0 + 2·1 = 34 = 6·6 − 2`.

Autocorrelations: `N_Z(1) = -1`, `N_Z(2) = 0`, `N_Z(3) = 1`, `N_Z(4) = -2`, `N_Z(5) = -1`. Doubled,
these are the `2·N_Z` column of the lag table.

Z plays a distinguished role further down the pipeline: it is the head of both base sequences
(`A = Z ++ W`, `B = Z ++ (−W)` in [step1](#/node/step1)) and the first `n` positions of the
T-sequence in [step2](#/node/step2).
