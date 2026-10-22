---
id: turynToHadamardMatrix_isHadamard
title: "The constructed matrix is Hadamard (bundled form)"
summary: "`IsHadamardMat (turynToHadamardMatrix T)` for every bundled Turyn-type quadruple `T`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A one-line consequence of [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) applied to `step2 T`. All the work is in the general T-sequence theorem."
  - "No hypothesis on `n`; at `n = 0` it is the vacuous 0 × 0 case."
  - "`#print axioms` reports only the three standard axioms."
quiz:
  - q: "How is it proved?"
    type: choice
    choices: ["`simpa [turynToHadamardMatrix] using typedGsMatrix_isHadamard (step2 T)`", "`native_decide`", "by induction on `n`"]
    answer: 0
    explain: "Literally that. The content is in [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) and [step2](#/node/step2)."
  - q: "What does `step2 T` contribute?"
    type: choice
    choices: ["the ±1 property", "a `TSequence (3 * n - 1)`, which is the hypothesis the general theorem needs", "nothing"]
    answer: 1
    explain: "`step2` is where the Turyn condition is converted into a T-sequence's `support` and `periodic_vanishing` fields."
  - q: "Which form takes a loose certificate instead of a record?"
    type: text
    answer: ["ofIsTurynTypeMatrix_isHadamard", "Turyn.ofIsTurynTypeMatrix_isHadamard"]
    explain: "[ofIsTurynTypeMatrix_isHadamard](#/node/ofIsTurynTypeMatrix_isHadamard), which calls this one on `h.toTyped`."
---

## Plain English

```
theorem turynToHadamardMatrix_isHadamard {n : Nat} (T : TurynType n) :
    IsHadamardMat (turynToHadamardMatrix T) := by
  simpa [turynToHadamardMatrix] using typedGsMatrix_isHadamard (step2 T)
```

The pipeline's correctness, in the form that takes a bundled quadruple.

There is nothing to it once the two halves are in place: [step2](#/node/step2) turns `T` into a
`TSequence (3 * n - 1)`, and [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) says every
T-sequence gives a Hadamard matrix. The division of labour is worth noticing — the Turyn condition
is used *only* inside `step2`, and the matrix algebra knows nothing about it.
