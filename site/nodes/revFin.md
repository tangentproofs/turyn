---
id: revFin
title: "revFin: index reversal on Fin n"
summary: "`revFin i = ⟨n - 1 - i.1, _⟩` — the index `i` counted from the other end."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "`Nat` subtraction, but the bound `i.1 < n` makes `n - 1 - i.1 < n` honest. At `n = 0` the type `Fin 0` is empty, so there is nothing to reverse."
  - "It is an involution (`revFin_involutive`), and the simp lemma `revFin_eq_iff` lets you move it across an equation."
quiz:
  - q: "What is `revFin` of index `0` in `Fin 5`?"
    type: number
    answer: 4
    explain: "`5 - 1 - 0 = 4`."
  - q: "What is `revFin (revFin i)`?"
    type: text
    answer: ["i", "the same index", "revFin (revFin i) = i"]
    explain: "`revFin_involutive`, proved by `Fin.ext` and `omega`."
  - q: "Which matrix is built from it?"
    type: text
    answer: ["reversalMatrix", "the reversal matrix", "reversalMatrix n", "R"]
    explain: "[reversalMatrix n](#/node/reversalMatrix) `i j = if j = revFin i then 1 else 0`."
---

## Plain English

```
def revFin {n : Nat} (i : Fin n) : Fin n := ⟨n - 1 - i.1, _⟩
```

"Count from the other end": `0 ↦ n−1`, `1 ↦ n−2`, and so on. An involution.

In the Lean it is used for one thing: the [reversal matrix](#/node/reversalMatrix) `R` that twists
the Goethals–Seidel blocks, `R i j = if j = revFin i then 1 else 0`. The two private lemmas
`revFin_sub_comm` (`revFin j - i = revFin i - j`) and `sub_revFin_comm` are the small commutation
facts that the block cancellations run on.

The sequence-level reversal [reverseFn](#/node/reverseFn) — behind the `revX`…`revW`
[elementary moves](#/node/Elementary) — writes out the same index map `i ↦ n - 1 - i` for itself;
the two definitions live in different files and neither mentions the other.
