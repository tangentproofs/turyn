---
id: appendFn
title: "appendFn: concatenate two sequences"
summary: "`appendFn a b : Fin (n + m) → Int` is `a` on the first `n` positions and `b` on the rest."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The result type is `Fin (n + m)`, so using it where `Fin (2 * n - 1)` is expected needs the relabelling `2 * n - 1 = n + (n - 1)` — `two_n_sub_one_eq`, proved by cases on `n` because of `Nat` subtraction."
  - "A dependent `if` on `i.1 < n`, since both branches need an in-range index."
quiz:
  - q: "What is `appendFn a b i` for `i.1 ≥ n`?"
    type: choice
    choices: ["`0`", "`b ⟨i.1 - n, _⟩`", "`a ⟨i.1, _⟩`"]
    answer: 1
    explain: "`else b ⟨i.1 - n, by have := i.2; omega⟩`. Unlike [lookupNat](#/node/lookupNat) there is no out-of-range default — the `Fin (n + m)` index guarantees the shifted index is in range for `b`."
  - q: "Does it preserve [AllPmOne](#/node/AllPmOne)?"
    type: choice
    choices: ["yes (`AllPmOne_appendFn`), if both inputs do", "no"]
    answer: 0
    explain: "Each entry of the result is an entry of `a` or of `b`."
  - q: "Where is it used?"
    type: choice
    choices: ["[step1](#/node/step1), to build `A = Z ++ W` and `B = Z ++ (−W)`", "[step2](#/node/step2)", "in the Goethals–Seidel array"]
    answer: 0
    explain: "`step2` places its components in windows of a fixed-length array instead of concatenating, which is why `appendFn` appears only on the base-sequence side road."
---

## Plain English

```
def appendFn {n m : Nat} (a : Fin n → Int) (b : Fin m → Int) : Fin (n + m) → Int :=
  fun i =>
    if h : i.1 < n then a ⟨i.1, h⟩
    else b ⟨i.1 - n, by have := i.2; omega⟩
```

`List.append` for `Fin`-indexed functions. Simple, but the lemma that matters about it is
`concat_neg_autocorr_sum_fn`:

`N_{Z++W}(s) + N_{Z++(−W)}(s) = 2·N_Z(s) + 2·N_W(s)`

which is the whole mathematical content of [step1](#/node/step1) and explains the factor 2 in the
Turyn weights. The proof goes through `pointwise_cancel_fn`, a case analysis on whether a product
at lag `s` lies entirely inside Z, entirely inside W, or straddles the join.
