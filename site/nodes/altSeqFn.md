---
id: altSeqFn
title: "altSeqFn: multiply entry i by (−1)ⁱ"
summary: "`altSeqFn a i = (if i.1 % 2 = 0 then 1 else -1) * a i` — alternating sign flips, by 0-indexed position."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Written with an `if` on `i.1 % 2` rather than a power `(-1)^i`; the lemma `aperiodicAutocorr_altSeqFn` is where the `(-1)^s` form appears."
  - "Its full name is `Turyn.altSeqFn` — it is declared inside the namespace while the other sequence operations ([negSeqFn](#/node/negSeqFn), [reverseFn](#/node/reverseFn), [appendFn](#/node/appendFn)) are at the root."
  - "Position 1 (index 0) is never flipped; position `n` (index `n - 1`) is flipped exactly when `n` is even."
quiz:
  - q: "Which entries keep their sign?"
    type: choice
    choices: ["those at even 0-indexed positions", "those at odd positions", "all of them"]
    answer: 0
    explain: "`if i.1 % 2 = 0 then (1 : Int) else -1`."
  - q: "What happens to `aperiodicAutocorr a s`?"
    type: choice
    choices: ["unchanged", "multiplied by `(−1)ˢ`", "multiplied by `(−1)ⁱ`"]
    answer: 1
    explain: "`aperiodicAutocorr_altSeqFn`. Each term gains `(−1)ⁱ(−1)^(i+s) = (−1)^(2i+s) = (−1)ˢ`."
  - q: "For which `n` does alternation flip the entry at 1-indexed position `n`?"
    type: choice
    choices: ["`n` even", "`n` odd", "every `n`"]
    answer: 0
    explain: "Index `n - 1` is odd exactly when `n` is even. This is the fact `step1_xAt_doAltAll_last` depends on, and the source of the even-`n` hypothesis in [canonical_representative_exists](#/node/canonical_representative_exists)."
---

## Plain English

```
def Turyn.altSeqFn {n : Nat} (a : Fin n → Int) : Fin n → Int :=
  fun i => (if i.1 % 2 = 0 then (1 : Int) else -1) * a i
```

The third family of elementary operations (BDKR's T3): flip the signs at alternate positions.

Two facts determine how it is used:

- **It scales autocorrelations.** At lag `s`, `N_{alt a}(s) = (−1)ˢ · N_a(s)`
  (`aperiodicAutocorr_altSeqFn`). So alternating a single sequence is *not* a legal move; only
  alternating all four, which multiplies the whole combined sum by `(−1)ˢ`
  ([TurynType.doAltAll](#/node/TurynType.doAltAll)).
- **It is anchored at the left end.** Index 0 gets factor `+1`, so 1-indexed position 1 is never
  touched; 1-indexed position `n` is flipped exactly when `n` is even. That asymmetry is what lets
  step 1 of the normalization fix `xₙ` and `yₙ` while keeping `x₁, y₁, z₁, w₁` positive, and it is
  why that step needs `n` even.
