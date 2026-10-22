---
id: kharaghani_2005_tt36
title: "The 2005 TT(36), checked by machine"
summary: "The four published Kharaghani–Tayfeh-Rezaie sequences really are Turyn-type: all 35 combined autocorrelations vanish."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "Proved by `native_decide`. `#print axioms` reports `Lean.ofReduceBool` and `Lean.trustCompiler` on top of the standard three, so the kernel did *not* re-evaluate the 35 sums — Lean's compiler and runtime did, and the kernel took their word. Earlier versions of `lean/README.md` called the library axiom-free beyond the standard three; that was never true of this theorem. See [#/trust](#/trust)."
  - "A kernel-only check is feasible, here too: outside this repository, `decide +kernel` proves this very statement — `IsTurynType kh05X kh05Y kh05Z kh05W` — with only `propext`, `Classical.choice` and `Quot.sound` (about 8 s of CPU on top of loading Mathlib), as it does the TT(6) analogue in seconds. The committed library still uses `native_decide`. See [#/trust](#/trust)."
  - "The theorem says these sequences pass the test. It says nothing about how they were found, nothing about uniqueness, and nothing about other TT(36)s."
widgets:
  - type: seq-editor
    title: "The 35 lags, and what one flipped entry does"
    config: { preset: kh05, show: [bars, table, energy] }
quiz:
  - q: "How many combined autocorrelations are checked?"
    type: number
    answer: 35
    explain: "`IsTurynType` quantifies over `1 ≤ s < n` with `n = 36`, so `s = 1 … 35`. The Boolean form `isTurynTypeBool` folds over `List.range (n - 1)` — the same 35 values."
  - q: "What are the lengths of the four sequences?"
    type: choice
    choices: ["36, 36, 36, 36", "36, 36, 36, 35", "36, 36, 35, 35", "35, 35, 35, 36"]
    answer: 1
    explain: "`kh05X, kh05Y, kh05Z : PmSeq 36` and `kh05W : PmSeq 35`. The shape `(n, n, n, n − 1)` is what [IsTurynType](#/node/IsTurynType) requires."
  - q: "Which is the honest description of what checked this theorem?"
    type: choice
    choices: ["Lean's kernel evaluated the 35 sums", "Lean's compiler produced native code, ran it, and the kernel accepted the Boolean answer via `Lean.ofReduceBool`", "a human checked the sums by hand", "it is an axiom"]
    answer: 1
    explain: "That is exactly what `native_decide` does. It is a real machine check, but it trusts a larger stack than a kernel reduction does."
  - q: "True or false: this theorem implies the existence of a Hadamard matrix of order 428."
    type: choice
    choices: ["True, together with `Result.tt_implies_hadamard`", "True, on its own", "False in every reading"]
    answer: 0
    explain: "On its own it only says the quadruple is Turyn-type. Feed it to [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) and you get `∃ H : IntMat (4 * (3 * 36 - 1)), IsHadamardMat H`, and `4 * (3 * 36 - 1) = 428`."
---

## Plain English

Four strings of pluses and minuses were published in 2005 as the key to a Hadamard matrix of
order 428. This theorem is Lean saying: yes, those four strings pass the Turyn-type test.

The test, spelled out: for each shift `s` from 1 to 35, slide each sequence `s` places along
itself, multiply the overlapping entries, add them up to get `N(s)`, and then check that

```
N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s) = 0
```

All 35 of those come out zero, and they are not nearly zero by luck: flipping any single one of
the 143 entries breaks at least six of the 35 lags (a check made outside the Lean while writing
this page). The widget above lets you try it.

## In the Lean

```
theorem kharaghani_2005_tt36 : IsTurynType kh05X kh05Y kh05Z kh05W := by
  native_decide
```

The sequences are `pm!` string literals ([pmSeq!](#/node/pmSeq!),
[PmSeq.ofList](#/node/PmSeq.ofList)); their ±1-ness and their lengths are settled by the types
`PmSeq 36` and `PmSeq 35` at elaboration time, so the only thing left to check is the vanishing
condition. `isTurynTypeBool` is the `Bool`-valued version of that check, proved equivalent to the
`Prop` by `isTurynTypeBool_iff_IsTurynType`, which is what makes `IsTurynType` decidable and so
reachable by `native_decide`.

## Why it matters

This is the whole point of a formalization like this one: a result from a 2005 search paper, whose
correctness rests on a computation, gets re-run inside a proof assistant and tied by proved
theorems to the statement people actually care about. The cost is that this particular link in the
chain rests on the compiler rather than the kernel.
