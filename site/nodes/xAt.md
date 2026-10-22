---
id: xAt
title: "xAt: entry i of X, counting from 1"
summary: "`xAt S i = lookupNat S.X.data (i - 1)`: the paper's `xᵢ`, which is entry `i − 1` of the 0-indexed carrier, and `0` when `i` is out of range."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**`Nat` subtraction makes `xAt S 0` and `xAt S 1` the same entry.** `0 - 1 = 0`, so both read `S.X.data 0`. Nothing in the library ever asks for `xAt S 0`, but the definition does not reject it."
  - "Out of range it returns `0`, not an error: `xAt S i = 0` whenever `i > n` (or `i = 0 = n`). So `xAt S i = 1 ∨ xAt S i = -1` needs `1 ≤ i ≤ n` as a hypothesis — that is the lemma `xAt_pm` in `Turyn/XY.lean`."
  - "It reads only the `X` field. The three siblings [yAt](#/node/yAt), [zAt](#/node/zAt), [wAt](#/node/wAt) are the same definition on the other fields."
quiz:
  - q: "If `S.X.data = (a₀, a₁, a₂)`, what is `xAt S 2`?"
    type: text
    answer: ["a1", "a₁", "a_1", "the middle entry", "the second entry", "S.X.data 1", "lookupNat S.X.data 1"]
    explain: "`lookupNat S.X.data (2 - 1) = lookupNat S.X.data 1`, the second entry in 1-indexed terms."
  - q: "What is `xAt S 0`?"
    type: choice
    choices: ["`0`, since index 0 is invalid", "the same as `xAt S 1`, because `0 - 1 = 0` in `Nat`", "an error"]
    answer: 1
    explain: "`Nat` subtraction truncates at 0, so `xAt S 0 = lookupNat S.X.data 0 = xAt S 1` whenever `n ≥ 1`."
  - q: "What is `xAt S (n + 1)` for `S : TurynType n`?"
    type: number
    answer: 0
    explain: "`lookupNat S.X.data n`, and `n < n` is false, so [lookupNat](#/node/lookupNat) returns `0`."
  - q: "Why is 1-indexing used at all, when the carriers are `Fin n`?"
    type: choice
    choices: ["because Lean cannot index from 0", "for fidelity with the BDKR paper's notation, so the canonical conditions and the XY law read as published", "to avoid proofs"]
    answer: 1
    explain: "The docstring says 'for source-fidelity with the BDKR paper'. Statements like `uAt S (n + 1 - k) = -(uAt S k)` and the six endpoint conditions of [Canonical1](#/node/Canonical1) are much easier to compare with the literature this way."
---

## Plain English

```
def xAt {n : Nat} (S : TurynType n) (i : Nat) : Int := lookupNat S.X.data (i - 1)
```

The papers write `x₁, x₂, …, xₙ`; the Lean carriers are indexed `0, …, n−1`. `xAt` is the
translation layer, and it takes an ordinary `Nat`, so no range proof is needed at the call site.
Two consequences of that convenience:

- Out of range you silently get `0` ([lookupNat](#/node/lookupNat)'s default). The lemmas that
  need ±1-ness carry explicit bounds: `xAt_pm S i (hi1 : 1 ≤ i) (hi2 : i ≤ n)`.
- `i - 1` is `Nat` subtraction, so index `0` collides with index `1`. Harmless here, but worth
  knowing when you read a statement with arithmetic in the index, such as
  `xAt S (n + 1 - k)`.

Everything stated 1-indexed in the library — [Canonical1](#/node/Canonical1) through
`Canonical6`, [uAt](#/node/uAt), the [XY law](#/node/xy_product_law), `endpoint_relation` — is
built from these four accessors. The bridge back to the 0-indexed world is
`aperiodicAutocorr_A_via_xAt`:

```
aperiodicAutocorr S.X.data s = ∑ i ∈ range (n - s), xAt S (i + 1) * xAt S (i + 1 + s)
```

for `s < n`.
