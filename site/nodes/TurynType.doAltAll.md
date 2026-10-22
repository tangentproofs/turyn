---
id: TurynType.doAltAll
title: "TurynType.doAltAll: the altAll move"
summary: "Multiplies entry `i` of all four sequences by `(−1)ⁱ`, re-proving the vanishing condition with `vanishing_altAll`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This is the only [Elementary](#/node/Elementary) move that touches all four sequences at once — it has to, because alternating just one would multiply only that sequence's autocorrelations by `(−1)ˢ` and break the sum."
  - "The alternation is by 0-indexed position: `altSeqFn a = fun i => (if i.1 % 2 = 0 then 1 else -1) * a i`, so position 1 (index 0) is never flipped."
quiz:
  - q: "How many sequences does this move change?"
    type: number
    answer: 4
    explain: "`⟨S.X.alt, S.Y.alt, S.Z.alt, S.W.alt, Turyn.vanishing_altAll S⟩`."
  - q: "What does alternating do to an autocorrelation at lag `s`?"
    type: choice
    choices: ["leaves it alone", "multiplies it by `(−1)ˢ`", "sets it to 0"]
    answer: 1
    explain: "`aperiodicAutocorr_altSeqFn`. Each product `aᵢ·a_{i+s}` gains the factor `(−1)ⁱ(−1)^{i+s} = (−1)ˢ`. Doing it to all four lets the common factor be pulled out of the combined sum, which is then `(−1)ˢ · 0 = 0`."
  - q: "Which 1-indexed positions keep their sign under `altAll`?"
    type: choice
    choices: ["the odd ones (1, 3, 5, …)", "the even ones (2, 4, 6, …)", "all of them", "none of them"]
    answer: 0
    explain: "The factor is `(−1)ⁱ` at the *0-indexed* position `i`, so the 0-indexed even positions — 1-indexed 1, 3, 5, … — keep their sign. In particular position 1 does, which is why `altAll` can fix the far endpoints without disturbing the near ones in step 1 of the normalization (for even `n`, where position `n` is 0-indexed odd and so flips)."
  - q: "Would alternating only X preserve the Turyn condition?"
    type: choice
    choices: ["yes", "no — the combined sum would become `(−1)ˢ N_X + N_Y + 2N_Z + 2N_W`, which need not vanish"]
    answer: 1
    explain: "Hence there is no `altX` constructor; only the simultaneous move is legal."
---

## Plain English

```
def TurynType.doAltAll {n : Nat} (S : TurynType n) : TurynType n :=
  ⟨S.X.alt, S.Y.alt, S.Z.alt, S.W.alt, Turyn.vanishing_altAll S⟩
```

The alternation move (BDKR's T3): multiply every entry at an even 0-indexed position by `+1` and
every entry at an odd one by `−1`, in all four sequences at once.

Its effect on autocorrelations is a uniform factor `(−1)ˢ` at lag `s`, so the combined sum becomes
`(−1)ˢ` times what it was — still zero. That uniformity is why the move must be applied to all
four: alternating a single sequence would change the balance between the four terms.

What it buys the normalization: because position 1 keeps its sign and position `n` flips when `n`
is even, `altAll` can repair the two far endpoints `xₙ, yₙ` without disturbing `x₁, y₁, z₁, w₁`.
That is exactly how `step1_condition1` finishes, and where the even-`n` hypothesis of
[canonical_representative_exists](#/node/canonical_representative_exists) comes from.
