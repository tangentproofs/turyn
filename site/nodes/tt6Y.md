---
id: tt6Y
title: "tt6Y = ---+--"
summary: "The second sequence of the worked TT(6) example: six entries, sum `-4`, with its single `+1` at position 4."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Same `pm!` machinery as [tt6X](#/node/tt6X): length and ±1-ness are discharged by `decide` at elaboration."
  - "X and Y have the same sum here (`-4` each) but different autocorrelations, so they are not interchangeable even though [Elementary.swap](#/node/Elementary) would allow exchanging them."
quiz:
  - q: "What is `seqSum tt6Y.data`?"
    type: number
    answer: -4
    explain: "One `+1`, five `-1`s."
  - q: "At which 1-indexed position is the `+1`?"
    type: number
    answer: 4
    explain: "`---+--`: positions 1, 2, 3 are `-`, position 4 is `+`."
  - q: "What is `uAt S 4` for the TT(6) quadruple (`uAt = xAt * yAt`)?"
    type: number
    answer: -1
    explain: "`xAt 4 = -1` (from `----+-`) and `yAt 4 = 1`, so the product is `-1`. The whole `u` row is `+++--+`."
---

## Plain English

```
def tt6Y : PmSeq 6 := pm! "---+--"
```

Entries: `(-1, -1, -1, 1, -1, -1)`. Sum `-4`, the same as [tt6X](#/node/tt6X) — which is why the
energy identity for this quadruple reads `16 + 16 + 0 + 2 = 34`.

The product sequence `U = X · Y` is `(+1, +1, +1, -1, -1, +1)`, the row the
[XY law](#/node/Result.xy_interior_antipalindrome) is about. Its interior pairs `(u₂, u₅)` and
`(u₃, u₄)` are `(+1, -1)` and `(+1, -1)`: opposite, as the law predicts for a `Canonical1`
quadruple of even length. (This quadruple is not `Canonical1` as published, but `U` is unchanged by
negating both X and Y.)
