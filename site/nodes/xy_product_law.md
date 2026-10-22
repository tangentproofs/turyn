---
id: xy_product_law
title: "xy_product_law: the XY product law, proved by counting mod 4"
summary: "The underlying theorem behind the [XY interior anti-palindrome](#/node/Result.xy_interior_antipalindrome): for `n ≥ 4` and a `Canonical1` quadruple, `uAt S (n + 1 - k) = -(uAt S k)` whenever `2 ≤ k ≤ n - 1`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The hypothesis is [Canonical1](#/node/Canonical1) only — the endpoint signs. The other five canonical conditions are never used."
  - "`4 ≤ n` is the stated bound. The two base cases are proved separately, and `xy_base_k2` actually needs only `3 ≤ n`; the exported theorem does not take advantage of that."
  - "Proved by strong induction on `k` (`Nat.strongRecOn`), so the `k = 2` and `k = 3` cases must be established on their own — they are `xy_base_k2` and `xy_base_k3`."
  - "The corollary `xy_product_eq_neg_one` restates the conclusion as `xAt S k * yAt S k * xAt S (n+1-k) * yAt S (n+1-k) = -1` on the same range."
  - "The closing remark about `Canonical1` possibly being unnecessary is a brute-force observation at `n = 4`, `n = 6` and `n = 8`, not a theorem. `Canonical1` is a hypothesis the Lean proof uses; nothing here shows it is needed, and nothing shows it is not."
widgets:
  - type: xy-law
    title: "The conclusion, checked pair by pair"
    config: { preset: kh05 }
  - type: walkthrough
    title: "The induction step"
    config:
      steps:
        - text: "Fix k with 4 ≤ k ≤ n − 1, and look at the lag s = n − k"
          note: "The whole proof is about one row of the lag table, chosen so that the autocorrelation has exactly k terms."
        - text: "Replace Y by U: N_X(n−k) + N_Y(n−k) = Σ_{i<k} xᵢ·x_{i+n−k}·(1 + uᵢ·u_{i+n−k})"
          lean: "T_k_as_U_sum"
          note: "Uses yᵢ = xᵢ·uᵢ. Each factor (1 + uᵢuⱼ) is 0 or 2."
          uses: [uAt, yAt]
        - text: "Parity hammer: that sum is ≡ 2 (mod 4)"
          lean: "parity_hammer"
          note: "The vanishing condition gives N_X + N_Y = −2(N_Z + N_W), and N_Z(s) + N_W(s) is odd for 1 ≤ s ≤ n − 2 (because each autocorrelation is congruent to its own term count mod 2). Minus twice an odd number is 2 mod 4."
          hard: true
          uses: [IsTurynType]
        - text: "Split the k terms: the two end terms, plus interior terms paired as (m, k+1−m)"
          lean: "Finset.range k = {0} ∪ Finset.Ico 1 (k - 1) ∪ {k - 1}"
        - text: "Each interior pair is ≡ 0 (mod 4), by the induction hypothesis at j < k"
          lean: "interior_pair_mod4"
          note: "And when k is odd, the unpaired middle term is exactly 0 (middle_term_zero), since the induction hypothesis forces u·(−u) = −1 there."
        - text: "So the two end terms alone are ≡ 2 (mod 4) — which happens exactly when u_{n+1−k} = −u_k"
          lean: "endpoint_pair_mod4"
          note: "a(1+u) + a'(1+u') ≡ 2 (mod 4) ↔ u = −u', for ±1 values a, a', u, u'. Checked by `decide` on the sixteen cases."
quiz:
  - q: "What is the proof's induction principle?"
    type: choice
    choices: ["ordinary induction on `n`", "strong induction on `k` (`Nat.strongRecOn`)", "well-founded recursion on the sequences", "no induction"]
    answer: 1
    explain: "`induction' k using Nat.strongRecOn with k ih`: the step at `k` uses the statement at every `j < k`, because the interior pairing refers to indices `m` and `k + 1 − m`."
  - q: "Which lag of the autocorrelation table does the argument at index `k` use?"
    type: choice
    choices: ["`s = k`", "`s = n - k`", "`s = n - 1`", "all of them"]
    answer: 1
    explain: "`aperiodicAutocorr S.X.data (n - k) + aperiodicAutocorr S.Y.data (n - k)`, which has exactly `k` terms — one per index in `range k`."
  - q: "Why is `N_Z(s) + N_W(s)` odd for `1 ≤ s ≤ n - 2`?"
    type: choice
    choices: ["because Z and W are ±1 sequences of coprime lengths", "because each autocorrelation at lag `s` is a sum of `len − s` terms of ±1, so it is congruent to `len − s` mod 2; here that gives `(n − s) + (n − 1 − s)`, which is odd", "by `native_decide`"]
    answer: 1
    explain: "`autocorr_mod_two` then `autocorr_CD_sum_odd`. The sum of the two term counts is `2n − 1 − 2s`, always odd."
  - q: "What does `endpoint_pair_mod4` say, in words?"
    type: choice
    choices: ["the endpoints of X are equal", "for ±1 values, `a(1 + u) + a'(1 + u') ≡ 2 (mod 4)` exactly when `u = -u'`", "the endpoints contribute 0"]
    answer: 1
    explain: "A sixteen-case `decide`. If `u` and `u'` are both `1`, the sum is `2a + 2a' ∈ {4, 0, −4}`, all `≡ 0`; if both `-1`, the sum is `0`; if opposite, one term is `0` and the other is `±2`."
  - q: "True or false: the proof uses the full [Canonical](#/node/Canonical) predicate."
    type: choice
    choices: ["True", "False"]
    answer: 1
    explain: "False. Only [Canonical1](#/node/Canonical1), and within that only the four conditions on X and Y (via `uAt S 1 = uAt S n = 1`) plus the ±1-ness that comes from the types."
---

## Plain English

This is the theorem; [Result.xy_interior_antipalindrome](#/node/Result.xy_interior_antipalindrome)
is its re-export under the comparator's namespace. See that node for what the statement means. This
one is about **how it is proved**, because the argument is unusual and pretty.

```
theorem xy_product_law {n : Nat} (S : TurynType n) (hn : 4 ≤ n) (hc : Canonical1 n S) :
    ∀ k, 2 ≤ k → k ≤ n - 1 → uAt S (n + 1 - k) = -(uAt S k)
```

### The idea

Everything happens in one row of the lag table, at lag `s = n − k`. Two moves set it up.

**Trade Y for U.** Since `xᵢ² = 1`, we have `yᵢ = xᵢ·uᵢ`, and so each pair of terms combines:

`xᵢxⱼ + yᵢyⱼ = xᵢxⱼ(1 + uᵢuⱼ)`

The factor `1 + uᵢuⱼ` is `2` when `uᵢ = uⱼ` and `0` otherwise. So `N_X(n−k) + N_Y(n−k)` is a sum of
`k` terms, each either `0` or `±2` (`T_k_as_U_sum`).

**Pin the sum mod 4.** The Turyn condition says `N_X + N_Y = −2(N_Z + N_W)`. And `N_Z(s) + N_W(s)`
is always *odd* for `1 ≤ s ≤ n − 2`, because an autocorrelation of a ±1 sequence at lag `s` is a
sum of `len − s` terms of ±1 and so has the parity of `len − s`; adding the two gives
`(n − s) + (n − 1 − s) = 2n − 1 − 2s`, odd. Minus twice an odd number is `2` modulo 4. That is the
`parity_hammer`.

So: **a sum of `k` terms, each `0` or `±2`, is congruent to 2 mod 4.**

### Squeezing out the conclusion

Now split the `k` terms into the first, the last, and the interior, and pair the interior up: term
`m` with term `k + 1 − m`. The induction hypothesis (the law already known at indices `j < k`)
makes each such pair divisible by 4 (`interior_pair_mod4`, a sixty-four-case `decide` on signs).
When `k` is odd the middle term has no partner — and then the induction hypothesis makes it exactly
`0`, because it contains the factor `1 + u·(−u) = 0` (`middle_term_zero`).

What is left is the two end terms, which must therefore carry the whole residue 2 mod 4. Those two
terms are

`x_{n+1−k}(1 + u_{n+1−k}) + x_k(1 + u_k)`

and a sixteen-case check (`endpoint_pair_mod4`) shows that for ±1 values this is `≡ 2 (mod 4)`
**exactly when** `u_{n+1−k} = −u_k`. Done.

The base cases `k = 2` and `k = 3` are small enough to do by hand (`xy_base_k2`, `xy_base_k3`),
using the endpoint signs from [Canonical1](#/node/Canonical1).

### What makes this unusual

There is no clever algebraic identity and no appeal to the literature: the whole thing is a parity
count, and the `Canonical1` hypothesis is used only to know the values at the two ends. The result
was found by a machine search over conjectures (the docstring credits codex) and then proved. Something
the Lean leaves open: exhaustive enumeration of all 128 TT(4), all 1536 TT(6) and all 4096 TT(8)
quadruples finds none, canonical or not, that violates the conclusion (computed in JavaScript
outside the Lean while writing this page — the site's `xy-law` widget reports that finding in its
notes, but it only ever evaluates the one quadruple on screen). So `Canonical1` may be dispensable.
The Lean does not say that, and its proof does use the hypothesis.
