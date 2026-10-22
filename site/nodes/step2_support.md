---
id: step2_support
title: "step2_support: exactly one row is non-zero at each position"
summary: "The four rows built by step 2 have `|a| + |b| + |c| + |d| = 1` at every position."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Stated with `Int.natAbs`, so the sum is over `Nat`: four values from `{0, 1}` adding to `1`."
  - "The proof is `split_ifs` over the three windows followed by `decide`-style case analysis; the only real content is the ±1 fact `|(u+v)/2| + |(u−v)/2| = 1`."
quiz:
  - q: "What does the statement say at a position in `[0, n)`?"
    type: choice
    choices: ["`|Z i| + 0 + 0 + 0 = 1`", "all four are `±1`", "nothing"]
    answer: 0
    explain: "Only [step2a](#/node/step2a) is non-zero there, and `|Z i| = 1` because Z is a ±1 sequence (`PmSeq_natAbs_eq_one`)."
  - q: "Which case needs the half-sum/half-difference lemma?"
    type: choice
    choices: ["positions in `[0, n)`", "positions in `[n, 2n−1)`", "positions in `[2n−1, 3n−1)`"]
    answer: 2
    explain: "There `c` and `d` are `(x+y)/2` and `(x−y)/2`, and `natAbs_halfSum_add_natAbs_halfDiff_eq_one` says their absolute values add to 1."
  - q: "Which field of [TSequence](#/node/TSequence) does this discharge?"
    type: text
    answer: ["support", "(step2 T).support", "the support field", "support field"]
    explain: "`step2` sets `support := step2_support T`."
---

## Plain English

```
theorem step2_support {n : Nat} (T : TurynType n) (i : Fin (3 * n - 1)) :
    Int.natAbs (step2a T i) + Int.natAbs (step2b T i) +
      Int.natAbs (step2c T i) + Int.natAbs (step2d T i) = 1
```

The tiling half of [step2](#/node/step2). Four non-negative integers, each `0` or `1`, adding to
`1`: exactly one of the four rows carries a `±1` here.

By windows:

- `[0, n)` — only [step2a](#/node/step2a) is live, and `|Zᵢ| = 1`;
- `[n, 2n−1)` — only [step2b](#/node/step2b), and `|Wᵢ| = 1`;
- `[2n−1, 3n−1)` — [step2c](#/node/step2c) and [step2d](#/node/step2d) are the half-sum and
  half-difference, and for ±1 inputs exactly one of those is `±1`.

That last point is the only non-bookkeeping step, and it is four cases: `(x, y) = (1,1)` gives
`(1, 0)`, `(1,−1)` gives `(0, 1)`, and so on. The Lean closes it with `decide`.

Why it matters: this is what makes the four ± combinations of the rows entrywise ±1, and hence what
makes the Goethals–Seidel blocks ±1. See [gsDataOfTSequence](#/node/gsDataOfTSequence).
