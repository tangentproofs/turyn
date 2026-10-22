---
id: step2a_sign
title: "step2a_sign: row a has entries in {0, ±1}"
summary: "`AllSignOne (step2a T)`: every entry of the row is `0`, `1` or `-1`, so it can be packaged as a [SignSeq](#/node/SignSeq)."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is the proof obligation of the `SignSeq` wrapper in [step2](#/node/step2), nothing more. It is strictly weaker than [step2_support](#/node/step2_support), which also says how many of the four rows are non-zero at a position."
  - "Proved by `split_ifs` on the window test and then the ±1 property of the underlying sequence."
quiz:
  - q: "What does it claim about row a?"
    type: choice
    choices: ["every entry is ±1", "every entry is 0, 1 or −1", "exactly one entry is non-zero"]
    answer: 1
    explain: "[AllSignOne](#/node/AllSignOne) allows zeros, which row a certainly has: it is zero outside the window `[0, n)`."
  - q: "Where does row a carry non-zero entries?"
    type: choice
    choices: ["positions `[0, n)`", "positions `[n, 2n−1)`", "positions `[2n−1, 3n−1)`", "everywhere"]
    answer: 0
    explain: "Row a holds `Z` on `[0, n)` and `0` elsewhere — see [step2a](#/node/step2a)."
  - q: "Which is stronger, this lemma or [step2_support](#/node/step2_support)?"
    type: choice
    choices: ["this one", "`step2_support`, which pins down the total of the four absolute values", "they are equivalent"]
    answer: 1
    explain: "`step2_support` implies each `natAbs` is 0 or 1, hence each entry is in `{0, ±1}`. The library proves both because the `SignSeq` fields and the `support` field are separate obligations."
---

## Plain English

```
lemma step2a_sign {n : Nat} (T : TurynType n) : AllSignOne (step2a T)
```

A packaging lemma. [step2a](#/node/step2a) is a bare function `Fin (3 * n - 1) → Int`;
[step2](#/node/step2) needs it as a [SignSeq](#/node/SignSeq), which carries a proof that all
entries lie in `{0, ±1}`. This lemma is that proof: outside the window `[0, n)` the entry is
`0`, and inside it is an entry of `Z`.
