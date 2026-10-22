---
id: periodicAutocorr
title: "periodicAutocorr: sliding with wrap-around"
summary: "`periodicAutocorr x s = ∑ i : Fin n, x i * x (i + s)`, where `i + s` is addition in `Fin n` — so the shifted copy wraps around."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The shift is a `Fin n`, not a `Nat`. That is what makes the wrap-around automatic (Mathlib's `Fin` addition is modular) and why the T-sequence's vanishing condition reads `∀ s : Fin m, s.1 ≠ 0 → …` rather than using a `Nat` bound."
  - "Unlike [aperiodicAutocorr](#/node/aperiodicAutocorr), it always has exactly `n` terms, and there is no out-of-range guard."
  - "At `s = 0` it is `∑ x i ²`, which for a ±1 vector is `n`. The vanishing conditions always exclude `s = 0`."
quiz:
  - q: "How many terms does the sum have?"
    type: choice
    choices: ["`n - s`", "`n`", "`n - 1`"]
    answer: 1
    explain: "`∑ i : Fin n, x i * x (i + s)` — one per index, because the shifted copy wraps rather than sliding off."
  - q: "What is the type of the shift argument?"
    type: choice
    choices: ["`Nat`", "`Fin n`", "`Int`"]
    answer: 1
    explain: "`(s : Fin n)`. The addition `i + s` is then `Fin` addition, i.e. modulo `n`."
  - q: "How does it relate to the aperiodic version?"
    type: choice
    choices: ["`periodic s = aperiodic s`", "`periodic s = aperiodic s + aperiodic (n - s)`, for `s ≠ 0`", "`periodic s = 2 · aperiodic s`"]
    answer: 1
    explain: "`periodicAutocorr_eq_aperiodic` in `Turyn/TSequence.lean`: the wrapped products split into the ones that do not wrap (lag `s`) and the ones that do (lag `n − s`). This is the bridge between the Turyn condition and the Goethals–Seidel condition."
  - q: "For a ±1 vector, what is `periodicAutocorr x 0`?"
    type: text
    answer: ["n", "the length", "the length n"]
    explain: "Each term is `x i ² = 1`. The lemma is `periodicAutocorr_zero_pmOne`, and it is what puts `n` on the diagonal of `circulant x * (circulant x)ᵀ`."
---

## Plain English

```
def periodicAutocorr {n : Nat} (x : IntVec n) (s : Fin n) : Int :=
  ∑ i : Fin n, x i * x (i + s)
```

Same game as [aperiodicAutocorr](#/node/aperiodicAutocorr), but on a circle: instead of sliding the
copy off the end, you wrap it around, so there are always `n` products.

This is the version the matrix side needs. For a [circulant](#/node/circulant) matrix
`C = circulant x`, entry `(i, j)` of `C · Cᵀ` is exactly `periodicAutocorr x (i − j)`
(`circulant_mul_transpose_eq_periodicAutocorr`). So "all periodic autocorrelations at non-zero
shifts vanish" is the same as "`C · Cᵀ` is diagonal", and with ±1 entries the diagonal is `n`.

### The bridge

The Turyn condition is about *aperiodic* autocorrelations, and the array needs *periodic* ones.
The connection is one line of index bookkeeping:

```
periodicAutocorr x s = aperiodicAutocorr x s.1 + aperiodicAutocorr x (m - s.1)   (for s.1 ≠ 0)
```

A wrapped product either stays inside the sequence — contributing to lag `s` — or wraps, which
makes it a lag-`(m − s)` product. So if *both* lag `s` and lag `m − s` vanish aperiodically, the
periodic autocorrelation at `s` vanishes. Getting a sequence of length `m = 3n − 1` whose aperiodic
autocorrelations vanish at **every** non-zero lag is precisely what [step2](#/node/step2) achieves,
and `step2_periodic` then applies this bridge twice.
