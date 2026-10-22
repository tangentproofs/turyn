---
id: hadamard_428_exists
title: "A TT(36) exists, and 4(3·36 − 1) = 428"
summary: "States exactly two things: some quadruple of lengths (36, 36, 36, 35) is Turyn-type, and `hadamardOrder 36 = 428`. It does not itself assert that a Hadamard matrix of order 428 exists."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**The name promises more than the statement delivers.** The conclusion is `∃ X Y Z W, IsTurynType X Y Z W ∧ hadamardOrder 36 = 428`. There is no `IntMat 428` and no `IsHadamardMat` anywhere in it. The order-428 matrix follows in one step by applying [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) to [kharaghani_2005_tt36](#/node/kharaghani_2005_tt36), but no single theorem in this repository states `∃ H : IntMat 428, IsHadamardMat H`."
  - "The second conjunct, `hadamardOrder 36 = 428`, is closed arithmetic: it says nothing about the sequences and would be just as true with no sequences at all."
  - "Proved by `native_decide` (through `kh05_hadamard_order` and `kharaghani_2005_tt36`), so `#print axioms` reports `Lean.ofReduceBool` and `Lean.trustCompiler` in addition to the three standard axioms. The kernel does not re-run the check; Lean's compiler and runtime are trusted. (Earlier versions of `lean/README.md` claimed the library was axiom-free beyond the standard three; that was wrong for this theorem.) See [#/trust](#/trust)."
  - "Background, not Lean: that 428 was the smallest multiple of 4 with no known Hadamard matrix before 2005, and that these sequences are the ones Kharaghani and Tayfeh-Rezaie published, are claims from the literature. The Lean checks that *these* sequences satisfy *this* condition and nothing else."
  - "The docstring credits the 'base-sequence → T-sequence → Goethals–Seidel pipeline'. The Lean's actual construction skips base sequences: [turynToHadamardMatrix](#/node/turynToHadamardMatrix) goes straight from the quadruple to a T-sequence via [step2](#/node/step2). [step1](#/node/step1) builds base sequences and is proved correct, but no headline theorem uses it."
widgets:
  - type: hadamard
    title: "The order-428 matrix, built in your browser"
    config: { source: kh05 }
  - type: outline
    title: "What you have to add to get the matrix"
    config:
      steps:
        - text: "hadamard_428_exists: there is a TT(36), and hadamardOrder 36 = 428"
        - text: "kharaghani_2005_tt36: the explicit witness is (kh05X, kh05Y, kh05Z, kh05W)"
          link: "kharaghani_2005_tt36"
        - text: "Result.tt_implies_hadamard applied to it: ∃ H : IntMat (4 * (3 * 36 - 1)), IsHadamardMat H"
          link: "Result.tt_implies_hadamard"
          note: "This step is not taken anywhere in the library. It is one line."
        - text: "Rewrite the order with kh05_hadamard_order: a Hadamard matrix of order 428"
quiz:
  - q: "Does this theorem, on its own, assert that a Hadamard matrix of order 428 exists?"
    type: choice
    choices: ["yes", "no — it asserts a TT(36) exists and that 4(3·36 − 1) = 428"]
    answer: 1
    explain: "The statement is `∃ (X Y Z : PmSeq 36) (W : PmSeq 35), IsTurynType X Y Z W ∧ hadamardOrder 36 = 428`. No matrix type appears. Combining it with [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) gives the matrix, but that combination is not performed in the repository."
  - q: "How many lags does `IsTurynType X Y Z W` check at `n = 36`?"
    type: number
    answer: 35
    explain: "`∀ s, 1 ≤ s → s < 36`, so `s = 1 … 35`: 35 lags. Each is the combined sum `N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s)`."
  - q: "Which axioms does `#print axioms hadamard_428_exists` report beyond `propext`, `Classical.choice` and `Quot.sound`?"
    type: choice
    choices: ["none", "`Lean.ofReduceBool` and `Lean.trustCompiler`", "`Lean.ofReduceNat`", "a project-specific axiom"]
    answer: 1
    explain: "Both of its ingredients are proved by `native_decide`, which compiles the check and asks the kernel to accept the result via `Lean.ofReduceBool` (plus `Lean.trustCompiler`). That is the difference from the general theorems, which use only the standard three axioms."
  - q: "The second conjunct `hadamardOrder 36 = 428` depends on which of the four sequences?"
    type: choice
    choices: ["all four", "only Z and W", "none — it is pure arithmetic about the number 36"]
    answer: 2
    explain: "`hadamardOrder n = 4 * (3 * n - 1)`, a function of `n` alone. At `n = 36` it evaluates to 428 whatever the sequences are."
---

## Plain English

This is the library's headline about the famous case, and it is worth reading slowly, because the
name is more generous than the statement.

What it says: there exist four ±1 sequences of lengths 36, 36, 36 and 35 that are
[Turyn-type](#/node/IsTurynType) — and, separately, `4 * (3 * 36 - 1)` equals 428.

What it does not say: that a 428 × 428 ±1 matrix with orthogonal rows exists. That conclusion is
one application of [Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) away, and the
library has every piece needed; it simply never writes that line down. If you want the matrix as a
formal object, the nearest thing in the repository is
`Turyn.ofIsTurynTypeMatrix kharaghani_2005_tt36 : IntMat (4 * (3 * 36 - 1))`, which is exactly what
[tt6_hadamard](#/node/tt6_hadamard) does at `n = 6`.

The witnesses are the sequences published by Kharaghani and Tayfeh-Rezaie in 2005:
[kh05X](#/node/kh05X), [kh05Y](#/node/kh05Y), [kh05Z](#/node/kh05Z), [kh05W](#/node/kh05W).

## In the Lean

```
theorem hadamard_428_exists :
    ∃ (X Y Z : PmSeq 36) (W : PmSeq 35),
      IsTurynType X Y Z W ∧ hadamardOrder 36 = 428 :=
  ⟨kh05X, kh05Y, kh05Z, kh05W, kharaghani_2005_tt36, kh05_hadamard_order⟩
```

Note `W : PmSeq 35` is written out rather than `PmSeq (36 - 1)`; they are the same type after
`Nat` subtraction. The proof is literally the tuple of witnesses plus the two theorems about them.

## Why it matters

Order 428 was the smallest multiple of 4 for which no Hadamard matrix was known until 2005.
Kharaghani and Tayfeh-Rezaie closed it by finding a TT(36). The raw space has `2^143` sign
patterns, which a search cuts down using symmetries and necessary conditions such as the
[energy identity](#/node/energy_identity) — that is what the Rust engine in this repository does.
Checking a candidate, by contrast, is 35 sums of products of ±1s; this theorem is that check, run
inside Lean.
