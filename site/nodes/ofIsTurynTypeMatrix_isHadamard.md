---
id: ofIsTurynTypeMatrix_isHadamard
title: "The entry point's correctness theorem"
summary: "`IsHadamardMat (ofIsTurynTypeMatrix h)` for every `IsTurynType` certificate `h`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A one-liner over [turynToHadamardMatrix_isHadamard](#/node/turynToHadamardMatrix_isHadamard), applied to `h.toTyped`."
  - "`#print axioms` reports only the three standard axioms — this is a statement about every `n` and every certificate, with no computation. (A *use* of it on a specific quadruple inherits that quadruple's axioms; see [tt6_hadamard_isHadamard](#/node/tt6_hadamard_isHadamard).)"
quiz:
  - q: "This theorem plus [ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix) make up the proof of which headline?"
    type: text
    answer: ["Result.tt_implies_hadamard", "tt_implies_hadamard"]
    explain: "`⟨Turyn.ofIsTurynTypeMatrix h, Turyn.ofIsTurynTypeMatrix_isHadamard h⟩` — the witness and the proof."
  - q: "What are its hypotheses?"
    type: choice
    choices: ["`n ≥ 1` and the certificate", "just the certificate `h : IsTurynType X Y Z W`", "the certificate and `n` even"]
    answer: 1
    explain: "Nothing about `n` at all."
  - q: "Does the theorem itself use `native_decide` anywhere?"
    type: choice
    choices: ["yes", "no"]
    answer: 1
    explain: "It is pure algebra. `native_decide` appears only in the example files, to establish `IsTurynType` for specific sequences."
---

## Plain English

```
theorem ofIsTurynTypeMatrix_isHadamard {n : Nat} {X Y Z : PmSeq n} {W : PmSeq (n - 1)}
    (h : IsTurynType X Y Z W) :
    IsHadamardMat (ofIsTurynTypeMatrix h) := by
  simpa [ofIsTurynTypeMatrix] using turynToHadamardMatrix_isHadamard h.toTyped
```

The last link in the chain. Together with the definition
[ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix), it is exactly the pair that
[Result.tt_implies_hadamard](#/node/Result.tt_implies_hadamard) packages as an existential, and it
is what [tt6_hadamard_isHadamard](#/node/tt6_hadamard_isHadamard) instantiates at `n = 6`.

Reading the chain from the bottom up:

- `ofIsTurynTypeMatrix_isHadamard h`
- ← [turynToHadamardMatrix_isHadamard](#/node/turynToHadamardMatrix_isHadamard) `h.toTyped`
- ← [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard) `(step2 h.toTyped)`
- ← `gsMatrix_isHadamard (gsDataOfTSequence …)`
- ← `gsMatrix_target` + `gsMatrix_pmOne`
- ← the block-matrix computation and `four_circulant_products_eq`
- ← `combinedPeriodic … = 0`, from the T-sequence's `periodic_vanishing`
- ← `step2_periodic`, from the Turyn vanishing condition.
