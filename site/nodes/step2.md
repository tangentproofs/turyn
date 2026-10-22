---
id: step2
title: "step2: a TT(n) becomes a T-sequence of length 3n − 1"
summary: "Lays Z, W, (X+Y)/2 and (X−Y)/2 out along `3n − 1` positions, and proves the result tiles and has vanishing periodic autocorrelations."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**The README's pipeline is not the Lean's.** `lean/README.md` describes a base-sequence → T-sequence → Goethals–Seidel route. The Lean's [turynToHadamardMatrix](#/node/turynToHadamardMatrix) applies `step2` directly to the quadruple; the base sequences of [step1](#/node/step1) are proved correct but are used by no headline theorem (their `depth` in the declaration graph is `null`)."
  - "`(X+Y)/2` and `(X−Y)/2` use integer division. That is safe but worth stating: for `x, y ∈ {±1}`, `x + y ∈ {−2, 0, 2}`, so the division is exact and every convention agrees. Exactly one of the two is non-zero at each position."
  - "`3 * n - 1` truncates: at `n = 0` it is `0`, so `step2` returns a `TSequence 0`, whose two conditions are vacuous."
  - "Lengths work out but not obviously: Z fills `[0, n)` (n positions), W fills `[n, 2n−1)` (n − 1 positions), and the two halves of X, Y share `[2n−1, 3n−1)` (n positions). Total `n + (n − 1) + n = 3n − 1`."
widgets:
  - type: tseq
    title: "The layout, position by position"
    config: { preset: tt6 }
  - type: walkthrough
    title: "Why the periodic autocorrelations vanish"
    config:
      steps:
        - text: "Each component's aperiodic autocorrelation equals that of the sequence it was built from"
          lean: "aperiodicAutocorr (step2a T) s = aperiodicAutocorr T.Z.data s"
          note: "Shifting a sequence inside a longer zero-padded window does not change its autocorrelations (aperiodicAutocorr_of_support)."
        - text: "The two halves of X and Y recombine: 2(N_{(X+Y)/2}(s) + N_{(X−Y)/2}(s)) = N_X(s) + N_Y(s)"
          lean: "halfSum_halfDiff_autocorr"
          note: "Pointwise: 2((u+v)/2·(u'+v')/2 + (u−v)/2·(u'−v')/2) = u·u' + v·v' for ±1 values."
          hard: true
        - text: "So the four components' aperiodic autocorrelations sum to N_X + N_Y + 2N_Z + 2N_W — which is 0 for every lag s ≥ 1"
          lean: "step2_aperiodic_vanishing"
          uses: [combinedAutocorr, IsTurynType]
        - text: "Each periodic autocorrelation at shift s splits as aperiodic s + aperiodic (3n−1−s)"
          lean: "periodicAutocorr_eq_aperiodic"
          uses: [periodicAutocorr]
        - text: "Both halves vanish, so the periodic sum vanishes: step2_periodic"
          uses: [TSequence]
quiz:
  - q: "What is the length of the T-sequence produced from a TT(6)?"
    type: number
    answer: 17
    explain: "`3 * 6 - 1 = 17`. The Hadamard matrix is then `4 · 17 = 68` square."
  - q: "Which positions does W occupy?"
    type: choice
    choices: ["`[0, n)`", "`[n, 2n−1)`", "`[2n−1, 3n−1)`", "all of them"]
    answer: 1
    explain: "`step2b T i = if i < n then 0 else if i < 2 * n - 1 then W (i - n) else 0`. That is `n − 1` positions, matching W's length."
  - q: "At a position in `[2n−1, 3n−1)`, which components are non-zero?"
    type: choice
    choices: ["all four", "exactly one of `c = (X+Y)/2` and `d = (X−Y)/2`", "`a` and `b`", "none"]
    answer: 1
    explain: "For `x, y ∈ {±1}`, exactly one of `(x+y)/2` and `(x−y)/2` is `±1` and the other is `0` — the lemma `natAbs_halfSum_add_natAbs_halfDiff_eq_one`, proved by `decide` on the four sign cases."
  - q: "Why is the integer division `(X + Y) / 2` harmless?"
    type: choice
    choices: ["because Lean rounds towards zero", "because `x + y` is always even for `x, y ∈ {±1}`, so the division is exact", "because the result is discarded"]
    answer: 1
    explain: "`x + y ∈ {−2, 0, 2}` and `x − y ∈ {−2, 0, 2}`, so no rounding happens and the choice of integer-division convention does not matter."
  - q: "Does the construction go through base sequences?"
    type: choice
    choices: ["yes, [step1](#/node/step1) first", "no — `turynToHadamardMatrix` calls `step2` on the quadruple directly"]
    answer: 1
    explain: "`def turynToHadamardMatrix (T : TurynType n) := typedGsMatrixOfTSequence (step2 T)`. [step1](#/node/step1) exists and is proved, but no headline theorem calls it."
---

## Plain English

The step that turns a Turyn-type quadruple into a [T-sequence](#/node/TSequence). Four rows of
length `3n − 1`, built by placing the four input sequences side by side:

| positions | count | row `a` | row `b` | row `c` | row `d` |
|---|---|---|---|---|---|
| `[0, n)` | `n` | `Z` | 0 | 0 | 0 |
| `[n, 2n−1)` | `n − 1` | 0 | `W` | 0 | 0 |
| `[2n−1, 3n−1)` | `n` | 0 | 0 | `(X+Y)/2` | `(X−Y)/2` |

The supports tile because of one small fact about ±1 numbers: of `(x+y)/2` and `(x−y)/2`, exactly
one is `±1` and the other is `0`. (If `x = y` the difference vanishes; if `x = −y` the sum does.)

```
def step2 {n : Nat} (T : TurynType n) : TSequence (3 * n - 1) :=
  { a := ⟨step2a T, step2a_sign T⟩
    b := ⟨step2b T, step2b_sign T⟩
    c := ⟨step2c T, step2c_sign T⟩
    d := ⟨step2d T, step2d_sign T⟩
    support := step2_support T
    periodic_vanishing := step2_periodic T }
```

## Why the autocorrelations work out

This is the mathematical core of the construction, and it is worth following.

**Zero-padding is free.** Putting a sequence into a longer window of zeros changes none of its
aperiodic autocorrelations: the extra products are all zero. So `N_a(s) = N_Z(s)`,
`N_b(s) = N_W(s)`, and the `c`, `d` rows have the autocorrelations of `(X+Y)/2` and `(X−Y)/2`.
(That is `aperiodicAutocorr_of_support`, the fiddliest lemma in the file, since it has to re-index
a sum over a sub-interval.)

**Halving and recombining is free too.** For ±1 values,

`2 · ( (u+v)/2 · (u'+v')/2 + (u−v)/2 · (u'−v')/2 ) = u·u' + v·v'`

(check the four sign cases). Summing over a lag gives
`2(N_{(X+Y)/2}(s) + N_{(X−Y)/2}(s)) = N_X(s) + N_Y(s)`.

**Put it together.** The four rows' aperiodic autocorrelations add up to

`N_Z(s) + N_W(s) + (N_X(s) + N_Y(s))/2`

which is exactly half of `N_X(s) + N_Y(s) + 2N_Z(s) + 2N_W(s)` — the combined autocorrelation the
Turyn condition kills for `1 ≤ s < n`. For `s ≥ n` every term vanishes on its own, because each
lag has passed the length of the sequence it came from. So the four rows' aperiodic
autocorrelations vanish at **every** lag `s ≥ 1`; that is `step2_aperiodic_vanishing`, and in the
Lean it is `linarith` from the vanishing condition and the halving identity.

**From aperiodic to periodic.** For a shift `s ≠ 0`,
`periodicAutocorr x s = aperiodicAutocorr x s + aperiodicAutocorr x (3n − 1 − s)`. Both lags are
`≥ 1`, so both halves vanish, and `step2_periodic` is done.

That last sentence is why the construction needs the condition at every lag rather than at most
lags: wrapping around turns lag `s` into lag `m − s`, so the whole table has to be clean.
