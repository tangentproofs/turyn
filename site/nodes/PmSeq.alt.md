---
id: PmSeq.alt
title: "PmSeq.alt: alternation, bundled"
summary: "`s.alt` multiplies entry `i` by `(−1)ⁱ`, packaged with the proof that ±1-ness survives."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Carrier is [altSeqFn](#/node/altSeqFn) `s.data`; proof field is `AllPmOne_altSeqFn s.pm`, since multiplying ±1 by ±1 gives ±1."
  - "Unlike negation and reversal, alternation *does* change autocorrelations — by a factor `(−1)ˢ` at lag `s`. That is why it is only legal as a simultaneous move on all four sequences ([TurynType.doAltAll](#/node/TurynType.doAltAll))."
quiz:
  - q: "Which 0-indexed positions get a sign flip?"
    type: choice
    choices: ["the even ones", "the odd ones", "all of them"]
    answer: 1
    explain: "`(if i.1 % 2 = 0 then (1 : Int) else -1) * a i`: index 0 is kept, index 1 flipped, and so on."
  - q: "Does alternation change autocorrelations?"
    type: choice
    choices: ["no", "yes — lag `s` is multiplied by `(−1)ˢ`"]
    answer: 1
    explain: "`aperiodicAutocorr_altSeqFn`. This is the one elementary operation that is not individually harmless."
  - q: "Why is the ±1 condition preserved?"
    type: choice
    choices: ["because the factor is itself ±1", "because the sum is preserved", "it is not"]
    answer: 0
    explain: "`AllPmOne_altSeqFn`: a product of two ±1 values is ±1."
---

## Plain English

```
def PmSeq.alt {n : Nat} (s : PmSeq n) : PmSeq n :=
  ⟨Turyn.altSeqFn s.data, AllPmOne_altSeqFn s.pm⟩
```

[altSeqFn](#/node/altSeqFn) lifted to [PmSeq](#/node/PmSeq), used by
[TurynType.doAltAll](#/node/TurynType.doAltAll).

The thing to remember about alternation is that it is *not* autocorrelation-preserving on its own:
at lag `s` it multiplies `N_a(s)` by `(−1)ˢ`. It only becomes a legal move when applied to all four
sequences at once, so that the common factor can be pulled out of the combined sum.
