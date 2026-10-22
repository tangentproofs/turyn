---
id: tt6W
title: "tt6W = -+++-"
summary: "The short sequence of the worked TT(6) example: five entries (one fewer than the others), sum 1."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Its type is `PmSeq 5`, written out rather than as `PmSeq (6 - 1)`; after `Nat` subtraction they are the same type."
  - "Same `pm!` machinery as [tt6X](#/node/tt6X)."
  - "It happens to be a palindrome (`-+++-` reads the same backwards). That is a property of this example, not a requirement — nothing in [IsTurynType](#/node/IsTurynType) asks for it."
quiz:
  - q: "How many entries does `tt6W` have?"
    type: number
    answer: 5
    explain: "`PmSeq 5`, one fewer than X, Y, Z. The shape `(n, n, n, n − 1)` is what [IsTurynType](#/node/IsTurynType) requires."
  - q: "What is `seqSum tt6W.data`?"
    type: number
    answer: 1
    explain: "Three `+1`s and two `-1`s. Since the length is odd, the sum must be odd (`sum_of_pm_ones_odd_iff`)."
  - q: "What is `aperiodicAutocorr tt6W.data 5`?"
    type: number
    answer: 0
    explain: "`tt6W` has length 5, so the guard `if s ≥ n then 0` fires. This is why the lag-5 row of the TT(6) table has no W contribution — and in general why lag `n − 1` gives the endpoint relation on X, Y, Z alone."
  - q: "Is `tt6W` a palindrome?"
    type: choice
    choices: ["yes", "no"]
    answer: 0
    explain: "`-+++-` reversed is `-+++-`. Reversal does not change any autocorrelation anyway (`aperiodicAutocorr_reverseFn`), so `revW` happens to be the identity on this sequence."
---

## Plain English

```
def tt6W : PmSeq 5 := pm! "-+++-"
```

Entries: `(-1, 1, 1, 1, -1)`. Sum `1`.

W is the odd one out in two ways. It is one entry shorter than the other three, so its 1-indexed
accessor [wAt](#/node/wAt) runs only to `n − 1`; and at the top lag `s = n − 1 = 5` it contributes
nothing at all, because [aperiodicAutocorr](#/node/aperiodicAutocorr) returns `0` once `s` reaches
the length. That is what makes the lag-`(n−1)` equation an identity about the *endpoints of X, Y
and Z only* — the `endpoint_relation` that drives the whole canonicalization story.

In the pipeline, W occupies positions `[n, 2n−1)` of the T-sequence ([step2](#/node/step2)), and in
the base-sequence picture it is the tail of `A = Z ++ W` and, negated, of `B = Z ++ (−W)`
([step1](#/node/step1)).
