---
id: wAt
title: "wAt: entry i of W, counting from 1"
summary: "`wAt S i = lookupNat S.W.data (i - 1)` — the 1-indexed accessor for `W`, whose length is `n - 1`, one shorter than the rest."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "`W` has length `n - 1`, so the valid 1-indexed range is `1 ≤ i ≤ n - 1`. `wAt S n` is out of range and returns `0`."
  - "**At `n ≤ 1` every `wAt` is `0`,** because `W : PmSeq 0` has no entries. This is exactly why [Canonical1](#/node/Canonical1) — which demands `wAt S 1 = 1` — cannot hold at `n = 1`, and one reason [canonical_representative_exists](#/node/canonical_representative_exists) assumes `2 ≤ n`."
  - "Same `Nat`-subtraction quirk as [xAt](#/node/xAt): `wAt S 0 = wAt S 1`."
quiz:
  - q: "For `S : TurynType 6`, which 1-indexed positions of `W` are real?"
    type: choice
    choices: ["1 to 6", "1 to 5", "0 to 5", "1 to 7"]
    answer: 1
    explain: "`W : PmSeq (6 - 1) = PmSeq 5`, so `wAt S i` is a genuine entry for `i = 1, …, 5` and `0` beyond."
  - q: "What is `wAt S 1` when `n = 1`?"
    type: number
    answer: 0
    explain: "`W : PmSeq (1 - 1) = PmSeq 0` has no entries, so [lookupNat](#/node/lookupNat) returns the default `0`."
  - q: "Can [Canonical1](#/node/Canonical1) hold for a `TurynType 1`?"
    type: choice
    choices: ["yes", "no — it requires `wAt S 1 = 1`, but that value is `0`"]
    answer: 1
    explain: "A nice example of the out-of-range default making a condition unsatisfiable rather than ill-typed."
  - q: "Which canonical condition pairs `wAt S i` with `wAt S (n - i)`?"
    type: choice
    choices: ["`Canonical4`", "`Canonical5`", "`Canonical6`"]
    answer: 1
    explain: "[Canonical5](#/node/Canonical5) compares `wAt S i * wAt S (n - i)` against `wAt S (n - 1)` — mirroring W about its own middle, which sits at `(n - 1)` positions rather than `n`."
---

## Plain English

```
def wAt {n : Nat} (S : TurynType n) (i : Nat) : Int := lookupNat S.W.data (i - 1)
```

The same accessor as [xAt](#/node/xAt), but on the short sequence. `W` has length `n − 1`, so:

- valid 1-indexed positions are `1 … n − 1`;
- `wAt S n` is `0`, not an entry;
- when `n ≤ 1`, *every* `wAt S i` is `0`.

That last point has a real consequence. [Canonical1](#/node/Canonical1) asks for `wAt S 1 = 1`, so
no `TurynType 1` is ever `Canonical1`, and the normalization theorem
[canonical_representative_exists](#/node/canonical_representative_exists) rules out `n = 1` by
hypothesis. The `moves` widget on that node says the same thing in the interface: at `n < 2` no
button can make `Canonical1` go green.

Because W is one shorter, the mirror symmetry used by [Canonical5](#/node/Canonical5) pairs `i`
with `n − i` rather than `n + 1 − i`.
