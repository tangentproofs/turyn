---
id: tt6X
title: "tt6X = ----+-"
summary: "The first sequence of the worked TT(6) example: six entries, five of them `-1`, sum `-4`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "`pm! \"----+-\"` expands to `PmSeq.ofList (pmSeq! \"----+-\") (by decide) (by decide)`. The two `decide` calls prove the length is 6 and all entries are ±1; they run in the kernel at elaboration time, so this definition needs no `native_decide`."
  - "`-` is the character for `-1` and `+` for `+1`. Any other character makes `pmSeq!` panic, which would show up when the definition is evaluated, not at parse time."
quiz:
  - q: "What is `seqSum tt6X.data`?"
    type: number
    answer: -4
    explain: "One `+1` and five `-1`s. `tt6_sums` records this, together with `-4`, `0`, `1` for Y, Z, W."
  - q: "What is `xAt S 5` when `S.X = tt6X`?"
    type: number
    answer: 1
    explain: "1-indexed position 5 of `----+-` is the `+`. [xAt](#/node/xAt) is `lookupNat S.X.data (5 - 1) = data 4`."
  - q: "What is the type of `tt6X`?"
    type: text
    answer: ["PmSeq 6", "Turyn.PmSeq 6", "PmSeq (6)", "a PmSeq 6"]
    explain: "`def tt6X : PmSeq 6 := pm! \"----+-\"`. The length is in the type, so the literal has to have exactly six characters."
---

## Plain English

```
def tt6X : PmSeq 6 := pm! "----+-"
```

Entries, 0-indexed: `(-1, -1, -1, -1, 1, -1)`. Sum `-4`.

Its own autocorrelations are `N_X(1) = 1`, `N_X(2) = 2`, `N_X(3) = 1`, `N_X(4) = 0`,
`N_X(5) = 1`: not individually special. What is special is how they combine with Y, Z and W —
see [tt6_valid](#/node/tt6_valid).

Note `xAt S 1 = -1` here, so this quadruple is not [Canonical1](#/node/Canonical1) as published.
Negating all four sequences (four `negX`/`negY`/`negZ`/`negW` moves) fixes all six endpoint signs
at once in this particular case.

The notation is [pmSeq!](#/node/pmSeq!) for the parse and [PmSeq.ofList](#/node/PmSeq.ofList) for
the packaging; the `pm!` macro combines them and discharges both side conditions with `decide`.
