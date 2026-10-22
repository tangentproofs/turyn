---
id: sum_sq_eq_len_add_two_totalAutocorr
title: "(Σ a)² = n + 2 · totalAutocorr a"
summary: "For any ±1 sequence of length `n`, the square of its sum equals `n` plus twice the total of its autocorrelations."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "This needs only `AllPmOne a` — no Turyn condition, no restriction on `n`. It holds for every ±1 sequence, including the empty one (`0 = 0 + 0`)."
  - "`↑n` on the right is the cast `(n : Int)`. The left side is a square in `Int`, so both sides live in `Int`."
  - "The `AllPmOne` hypothesis is used exactly once, to say each diagonal term `aᵢ²` is `1`. Without it the identity becomes `(Σ a)² = Σ aᵢ² + 2 · totalAutocorr a`, which is `sum_sq_expand` — also proved in the file, by induction on `n`."
widgets:
  - type: energy
    title: "Four instances of this identity, one per sequence"
    config: { preset: tt6 }
quiz:
  - q: "Which hypothesis does the theorem need?"
    type: choice
    choices: ["that the quadruple is Turyn-type", "only `AllPmOne a`", "`n ≥ 1`", "none"]
    answer: 1
    explain: "`theorem sum_sq_eq_len_add_two_totalAutocorr {n : Nat} (a : Fin n → Int) (h : AllPmOne a)`. One sequence, ±1 entries, nothing else."
  - q: "Check it on `a = +-+` (length 3, lags `N(1) = -2`, `N(2) = 1`): what common value do the two sides take?"
    type: number
    answer: 1
    explain: "`Σ a = 1`, so the left side is `1² = 1`. The right side is `3 + 2(-2 + 1) = 3 - 2 = 1` ✓."
  - q: "Where does the `n` on the right-hand side come from?"
    type: choice
    choices: ["the number of lags", "the diagonal terms `aᵢ · aᵢ`, each equal to 1", "the cast of the sum"]
    answer: 1
    explain: "Expanding `(Σ aᵢ)²` gives `Σ aᵢ²` plus twice the off-diagonal part. With ±1 entries each `aᵢ² = 1`, so the diagonal is `n`."
  - q: "Why the factor 2 on the autocorrelations?"
    type: choice
    choices: ["because Z and W are weighted 2", "because each off-diagonal pair `aᵢaⱼ` with `i ≠ j` is counted twice in the expansion", "it is a normalization choice"]
    answer: 1
    explain: "`aᵢaⱼ` and `aⱼaᵢ` are both terms of the square. Grouping the pairs with `j − i = s` gives `N_a(s)`, so the off-diagonal part is `2 Σ_{s ≥ 1} N_a(s)`."
---

## ELI5

Add up the pluses and minuses, then square the answer. You get the same thing as: the length of the
row, plus twice the total of all the sliding games played on that row. It works for every row of
pluses and minuses, Turyn or not.

## Plain English

```
theorem sum_sq_eq_len_add_two_totalAutocorr {n : Nat} (a : Fin n → Int) (h : AllPmOne a) :
    (seqSum a) ^ 2 = ↑n + 2 * totalAutocorr a
```

This is the algebraic heart of the [energy identity](#/node/energy_identity), and it is a fact
about *one* sequence with no Turyn condition in sight.

Expand the square:

`(Σᵢ aᵢ)² = Σᵢⱼ aᵢaⱼ = Σᵢ aᵢ² + 2 Σ_{i<j} aᵢaⱼ`

The first part is the diagonal. Each `aᵢ² = 1` because the entries are ±1 (that is the only use of
`h`), so it contributes `n`. The second part groups by the gap `s = j − i`: all pairs at gap `s`
together make up `N_a(s)`, so the whole off-diagonal part is `2 · Σ_{s ≥ 1} N_a(s)`, which is
`2 · totalAutocorr a`.

In the Lean this comes in two pieces. `sum_sq_expand` does the combinatorial rearrangement for an
arbitrary `a : Nat → Int`, by induction on `n` — the longest single proof in `Turyn/Energy.lean`,
because reindexing the inner sum at each step takes care. Then `sum_sq_eq_finset` specializes it
with `aᵢ² = 1` and identifies the grouped sums with `aperiodicAutocorr`, and a small bridge lemma
converts the `range`-based sum into [seqSum](#/node/seqSum)'s `Fin n` sum.

Applied four times with weights 1, 1, 2, 2, it gives the energy identity.
