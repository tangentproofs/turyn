---
id: vanishing_revW
title: "vanishing_revW: reversing W keeps the condition"
summary: "If `T` is Turyn-type then so is the quadruple with W replaced by `reverseFn T.W.data`: the combined autocorrelation still vanishes at every lag `1 ≤ s < n`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The conclusion is stated on the raw carriers, not on a bundled record. [TurynType.doRevW](#/node/TurynType.doRevW) is what turns it into a record-level operation."
  - "The quantifier range is the same `1 ≤ s → s < n` as [IsTurynType](#/node/IsTurynType) — no extra lags are claimed."
quiz:
  - q: "Which lemma about [aperiodicAutocorr](#/node/aperiodicAutocorr) does the proof use?"
    type: text
    answer: ["aperiodicAutocorr_reverseFn"]
    explain: "`unfold combinedAutocorr at hv ⊢; rw [aperiodicAutocorr_reverseFn]; exact hv` — one rewrite and the hypothesis is already the goal."
  - q: "Why does reversal not disturb the combined sum?"
    type: choice
    choices: ["because the other three sequences are unchanged and W's own autocorrelations are unchanged", "because the weights are 1, 1, 2, 2", "because `n` is even"]
    answer: 0
    explain: "At each lag the products are the same pairs, enumerated from the other end."
  - q: "Does the lemma need the entries to be ±1?"
    type: choice
    choices: ["yes", "no — it holds for any integer sequence; it is stated for `TurynType n` only because that is what carries the hypothesis"]
    answer: 1
    explain: "The underlying `aperiodicAutocorr` invariance is sign-agnostic. What is needed is `T.vanishing`, which comes from the record."
---

## Plain English

```
lemma vanishing_revW {n : Nat} (T : TurynType n) :
    ∀ s, 1 ≤ s → s < n → combinedAutocorr T.X.data T.Y.data T.Z.data (reverseFn T.W.data) s = 0
```

One of the eight single-sequence legality lemmas. Reversal leaves every autocorrelation of
W alone (`aperiodicAutocorr_reverseFn`, about [reverseFn](#/node/reverseFn)), and the other three sequences are untouched, so
`N_X + N_Y + 2N_Z + 2N_W` is literally the same number at every lag — and `T.vanishing` says it
is 0.

It is the `vanishing` field that [TurynType.doRevW](#/node/TurynType.doRevW) supplies, which
is what makes `revW` one of the ten [Elementary](#/node/Elementary) moves.
