---
id: step2_periodic
title: "step2_periodic: the T-sequence's periodic autocorrelations vanish"
summary: "At every non-zero shift, the four rows built by step 2 have periodic autocorrelations summing to zero."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is the step where the Turyn condition is actually consumed. Everything after it is matrix algebra that knows nothing about Turyn-type sequences."
  - "`#print axioms` reports only the three standard axioms: it is a statement about every `n` and every quadruple, proved without computation."
  - "The shift is `s : Fin (3 * n - 1)` with `s.1 ≠ 0`; the conclusion is about [periodicAutocorr](#/node/periodicAutocorr) (wrapping), not the aperiodic version."
widgets:
  - type: tseq
    title: "The periodic lag table of the T-sequence"
    config: { preset: tt6 }
quiz:
  - q: "What is the key decomposition used?"
    type: choice
    choices: ["`periodic s = aperiodic s`", "`periodic s = aperiodic s + aperiodic (m - s)`", "`periodic s = 2 · aperiodic s`"]
    answer: 1
    explain: "`periodicAutocorr_eq_aperiodic` with `m = 3n − 1`. A wrapped product either stays inside (lag `s`) or wraps (lag `m − s`)."
  - q: "Why do both halves of that decomposition vanish?"
    type: choice
    choices: ["because `s` and `m - s` are both `≥ 1`, and `step2_aperiodic_vanishing` covers every lag `≥ 1`", "because `m` is odd", "by the support condition"]
    answer: 0
    explain: "`s.1 ≠ 0` gives `s ≥ 1`, and `s < m` gives `m - s ≥ 1`. The aperiodic vanishing holds at *every* lag `≥ 1`, which is the point of `step2_aperiodic_vanishing`."
  - q: "Where is the Turyn vanishing condition used?"
    type: choice
    choices: ["here, directly", "inside `step2_aperiodic_vanishing`, for lags `1 ≤ s < n`", "nowhere"]
    answer: 1
    explain: "`step2_aperiodic_vanishing` splits on `s < n`: below `n` it applies `T.vanishing s`, and at or above `n` every term is individually zero by `aperiodicAutocorr_zero_of_ge`."
  - q: "How many shifts does the statement cover at `n = 6`?"
    type: number
    answer: 16
    explain: "`s : Fin 17` with `s.1 ≠ 0`, i.e. `s = 1, …, 16`."
---

## Plain English

```
theorem step2_periodic {n : Nat} (T : TurynType n) (s : Fin (3 * n - 1)) (hs : s.1 ≠ 0) :
    periodicAutocorr (step2a T) s + periodicAutocorr (step2b T) s +
      periodicAutocorr (step2c T) s + periodicAutocorr (step2d T) s = 0
```

The cancellation half of [step2](#/node/step2), and the hinge of the whole construction: this is
where the Turyn-type hypothesis gets spent.

Two ingredients.

**All aperiodic lags vanish.** `step2_aperiodic_vanishing` says the four rows' *aperiodic*
autocorrelations sum to zero at every lag `s ≥ 1`. For `1 ≤ s < n` this is the Turyn condition
(after the zero-padding and half-sum identities of [step2a](#/node/step2a) …
[step2d](#/node/step2d)). For `s ≥ n` it is free: each row's own sequence is shorter than `s`, so
every term is `0` by the guard in [aperiodicAutocorr](#/node/aperiodicAutocorr).

**Periodic splits into two aperiodic.** `periodicAutocorr_eq_aperiodic` says

`periodicAutocorr x s = aperiodicAutocorr x s + aperiodicAutocorr x (m − s)` (for `s ≠ 0`)

where `m = 3n − 1`. Both lags are at least 1, so both halves vanish, and `linarith` finishes.

Notice what the second ingredient demands: the condition has to hold at lag `m − s` as well as
lag `s`, which is why "every lag" in the first ingredient is not an overshoot. The Turyn condition
covering `1 ≤ s < n` is enough precisely because the extra lags up to `3n − 2` are automatically
zero.
