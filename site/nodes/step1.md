---
id: step1
title: "step1: base sequences from a TT(n) (proved, unused)"
summary: "Builds `A = Z ++ W`, `B = Z ++ (−W)`, `C = X`, `D = Y` and proves their four aperiodic autocorrelations cancel at every lag — a correct stage that the headline construction does not use."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**Unused by the headline results.** [turynToHadamardMatrix](#/node/turynToHadamardMatrix) calls [step2](#/node/step2) on the quadruple directly. `step1`'s `usedBy` list in the declaration graph is empty and its depth is `null`. The README's 'base-sequence → T-sequence → Goethals–Seidel' description is the classical route, not this library's code path."
  - "The length juggling is real but uninteresting: `2 * n - 1` and `n + (n - 1)` are equal as `Nat`s (`two_n_sub_one_eq`, by cases on `n`), and the private helper `step1_pmSeq` relabels the index so that `aperiodicAutocorr` is unchanged."
  - "At `n = 0` both are `0`, so the statement degenerates harmlessly."
widgets:
  - type: base-seq
    title: "A, B, C, D and why their lags cancel"
    config: { preset: tt6 }
quiz:
  - q: "What are the four base sequences?"
    type: choice
    choices: ["`Z ++ W`, `Z ++ (−W)`, `X`, `Y`", "`X ++ Y`, `X ++ (−Y)`, `Z`, `W`", "`(X+Y)/2`, `(X−Y)/2`, `Z`, `W`"]
    answer: 0
    explain: "`a := Z ++ W`, `b := Z ++ (−W)` (built with `appendFn` and `negSeqFn`), `c := T.X`, `d := T.Y`."
  - q: "What is `N_A(s) + N_B(s)` in terms of Z and W?"
    type: choice
    choices: ["`N_Z(s) + N_W(s)`", "`2·N_Z(s) + 2·N_W(s)`", "`N_Z(s) · N_W(s)`"]
    answer: 1
    explain: "`concat_neg_autocorr_sum_fn`. Pure Z–Z and W–W products appear in both A and B with the same sign, so they double; mixed Z–W products appear with opposite signs and cancel."
  - q: "Which lags does the vanishing field cover?"
    type: choice
    choices: ["`1 ≤ s < n`", "`1 ≤ s < 2n − 1`", "every `s ≥ 1`"]
    answer: 2
    explain: "`∀ s : Nat, 1 ≤ s → …`. For `s ≥ n` the proof notes every term is individually `0`, by `aperiodicAutocorr_zero_of_ge`."
  - q: "Where does the factor 2 in the Turyn condition go?"
    type: choice
    choices: ["it is dropped", "it is absorbed by Z and W each appearing twice, once in A and once in B", "it becomes a factor 4"]
    answer: 1
    explain: "That is exactly the point of the `(Z ++ W, Z ++ (−W))` pair, and it is why base sequences satisfy an *unweighted* vanishing condition."
---

## Plain English

```
def step1 {n : Nat} (T : TurynType n) : BaseSeqData n :=
  { a := Z ++ W, b := Z ++ (−W), c := T.X, d := T.Y, vanishing := … }
```

(The Lean writes the concatenations with `appendFn` and `negSeqFn`, through a private helper that
relabels `Fin (n + (n - 1))` as `Fin (2 * n - 1)`.)

The construction that explains where the 1, 1, 2, 2 weights of
[combinedAutocorr](#/node/combinedAutocorr) come from. Concatenate Z with W, and separately Z with
minus W, and look at what happens to the autocorrelations.

A product inside `A = Z ++ W` at lag `s` pairs either two Z entries, two W entries, or one of each.
In `B = Z ++ (−W)`:

- a Z–Z product is identical;
- a W–W product has both factors negated, so it is identical;
- a Z–W product has exactly one factor negated, so it is the negative.

Adding `N_A(s)` and `N_B(s)` therefore **doubles** the pure products and **cancels** the mixed
ones:

`N_A(s) + N_B(s) = 2·N_Z(s) + 2·N_W(s)`

(the lemma `concat_neg_autocorr_sum_fn`). With `C = X` and `D = Y` contributing once each, the
unweighted base-sequence condition

`N_A + N_B + N_C + N_D = 0`

is literally the Turyn condition `N_X + N_Y + 2N_Z + 2N_W = 0`. Which is the whole content of
`step1`.

## And then it is not used

This is the classical first stage of the Turyn construction, and it is proved here in full. But
[turynToHadamardMatrix](#/node/turynToHadamardMatrix) does not call it: [step2](#/node/step2)
builds its T-sequence straight from the quadruple, placing Z and W in separate windows rather than
concatenating them. Both routes work; the Lean took the shorter one and left this file as a
proved-but-unused road. If you are checking the library against the README, this is the one place
the two descriptions genuinely diverge.
