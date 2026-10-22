---
id: zAt
title: "zAt: entry i of Z, counting from 1"
summary: "`zAt S i = lookupNat S.Z.data (i - 1)` — the 1-indexed accessor for the `Z` field."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Same conventions as [xAt](#/node/xAt): `Nat` subtraction, and `0` out of range."
  - "Z carries weight 2 in [combinedAutocorr](#/node/combinedAutocorr), so it is not interchangeable with X or Y. Among the ten [Elementary](#/node/Elementary) moves there is no 'swap Z with X'."
quiz:
  - q: "`zAt S i` reads which field?"
    type: choice
    choices: ["`S.Z`", "`S.X`", "`S.W`"]
    answer: 0
    explain: "`lookupNat S.Z.data (i - 1)`."
  - q: "For a `Canonical1` quadruple with `n ≥ 2`, what is `zAt S n`?"
    type: number
    answer: -1
    explain: "This is `lemma1_endpoint_constraint`. The vanishing condition at lag `n - 1` gives `x₁xₙ + y₁yₙ + 2z₁zₙ = 0`; with `x₁ = xₙ = y₁ = yₙ = z₁ = 1` that forces `2 zₙ = -2`."
  - q: "Which of the six [Canonical1](#/node/Canonical1) conditions mentions `zAt`?"
    type: choice
    choices: ["`zAt S 1 = 1` only", "`zAt S 1 = 1` and `zAt S n = 1`", "none"]
    answer: 0
    explain: "Only the first entry. The last entry of Z is not a free choice — it is forced to `-1`, as the previous question shows, so asking for it to be `+1` would make the condition unsatisfiable."
---

## Plain English

```
def zAt {n : Nat} (S : TurynType n) (i : Nat) : Int := lookupNat S.Z.data (i - 1)
```

Mechanically identical to [xAt](#/node/xAt). The interesting thing about Z is the asymmetry of its
role: it carries weight 2 in the vanishing condition, it ends up as the *head* of the base
sequences `A = Z ++ W` and `B = Z ++ (−W)` in [step1](#/node/step1), and as the first `n` positions
of the T-sequence in [step2](#/node/step2).

One nice consequence of the vanishing condition shows up here. At lag `n − 1` only the end entries
survive, giving `x₁xₙ + y₁yₙ + 2z₁zₙ = 0` (`endpoint_relation`). Under
[Canonical1](#/node/Canonical1), five of those six entries are `+1`, so `zAt S n = -1` is forced
(`lemma1_endpoint_constraint`). That is why `Canonical1` normalizes only `z₁` and not `zₙ`: the
other end is not available to normalize.
