---
id: vanishing_altAll
title: "vanishing_altAll: alternating all four keeps the condition"
summary: "Multiplying entry `i` of all four sequences by `(−1)ⁱ` preserves the vanishing condition, because every autocorrelation is scaled by the same factor `(−1)ˢ`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The move has to be applied to **all four** sequences. Alternating one would scale only one term of the combined sum, which need not keep it zero. There is no `vanishing_altX`."
  - "Stated on the raw carriers; [TurynType.doAltAll](#/node/TurynType.doAltAll) is the record-level version."
quiz:
  - q: "What factor does alternation put on `aperiodicAutocorr a s`?"
    type: choice
    choices: ["`(−1)ⁱ`", "`(−1)ˢ`", "`1`", "`(−1)ⁿ`"]
    answer: 1
    explain: "`aperiodicAutocorr_altSeqFn`. Each term gains `(−1)ⁱ · (−1)^(i+s) = (−1)ˢ`."
  - q: "How does the proof finish, once the factor is pulled out?"
    type: choice
    choices: ["`rw [factored, hv, mul_zero]` — the combined sum is `(−1)ˢ · 0`", "by `decide`", "by induction on `s`"]
    answer: 0
    explain: "Exactly that: a `ring`-proved regrouping, then the hypothesis, then `(−1)ˢ · 0 = 0`."
  - q: "Could you alternate just X and Y?"
    type: choice
    choices: ["yes", "no — the Z and W terms would keep their old sign and the sum need not vanish"]
    answer: 1
    explain: "Only the simultaneous move factors cleanly. The library provides no partial alternation."
---

## Plain English

```
lemma vanishing_altAll {n : Nat} (T : TurynType n) :
    ∀ s, 1 ≤ s → s < n →
      combinedAutocorr (Turyn.altSeqFn T.X.data) (Turyn.altSeqFn T.Y.data)
        (Turyn.altSeqFn T.Z.data) (Turyn.altSeqFn T.W.data) s = 0
```

The legality proof for the one move that touches all four sequences.

[altSeqFn](#/node/altSeqFn) multiplies each autocorrelation at lag `s` by `(−1)ˢ`
(`aperiodicAutocorr_altSeqFn`). Applied to all four, that common factor comes out of the combined
sum:

`(−1)ˢ·N_X + (−1)ˢ·N_Y + 2(−1)ˢ·N_Z + 2(−1)ˢ·N_W = (−1)ˢ(N_X + N_Y + 2N_Z + 2N_W)`

(a `ring` step in the Lean), and the bracket is `0` by `T.vanishing`. Hence
[TurynType.doAltAll](#/node/TurynType.doAltAll) is well defined and `altAll` is an
[Elementary](#/node/Elementary) move.
