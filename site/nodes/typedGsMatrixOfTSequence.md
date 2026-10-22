---
id: typedGsMatrixOfTSequence
title: "typedGsMatrixOfTSequence: T-sequence in, matrix out"
summary: "`gsMatrix (gsDataOfTSequence T).toGSData` — the `4m × 4m` matrix attached to a T-sequence of length `m`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "A definition with no conditions attached; the theorem about it is [typedGsMatrix_isHadamard](#/node/typedGsMatrix_isHadamard)."
  - "The `.toGSData` projection appears because [gsMatrix](#/node/gsMatrix) takes the plain [GSData](#/node/GSData) and [CertifiedGSData](#/node/CertifiedGSData) extends it — the certificate is needed for the theorem, not for building the matrix."
quiz:
  - q: "What is the order of `typedGsMatrixOfTSequence T` for `T : TSequence m`?"
    type: choice
    choices: ["`m`", "`4m`", "`4m − 1`"]
    answer: 1
    explain: "`def typedGsMatrixOfTSequence {m : Nat} (T : TSequence m) : IntMat (4 * m)`."
  - q: "For a T-sequence coming from a TT(6), what is `m`?"
    type: number
    answer: 17
    explain: "[step2](#/node/step2) returns a `TSequence (3 * n - 1)`, which is `17` at `n = 6`. The matrix is then `68 × 68`."
  - q: "Why `.toGSData`?"
    type: choice
    choices: ["because `gsMatrix` does not need the vanishing certificate to build the matrix", "a naming accident", "because `CertifiedGSData` is a type synonym"]
    answer: 0
    explain: "The ±1 entries come from `GSData`; the certificate is only needed to prove orthogonality."
---

## Plain English

```
def typedGsMatrixOfTSequence {m : Nat} (T : TSequence m) : IntMat (4 * m) :=
  gsMatrix (gsDataOfTSequence T).toGSData
```

Two steps in one: form the four ± combinations
([gsDataOfTSequence](#/node/gsDataOfTSequence)), then assemble their circulants into the
Goethals–Seidel array ([gsMatrix](#/node/gsMatrix)).

It is the second half of [turynToHadamardMatrix](#/node/turynToHadamardMatrix), whose first half is
[step2](#/node/step2).
