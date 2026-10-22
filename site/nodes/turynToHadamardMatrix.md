---
id: turynToHadamardMatrix
title: "turynToHadamardMatrix: the construction, in one line"
summary: "`typedGsMatrixOfTSequence (step2 T)`: run step 2 on a bundled TT(n), then build the Goethals–Seidel array."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**No base sequences.** The classical pipeline has a base-sequence stage; this definition goes straight from the quadruple to a T-sequence. [step1](#/node/step1) is proved but unused here."
  - "A definition, so it computes: all `16 (3n − 1)²` entries can be evaluated. Its correctness is [turynToHadamardMatrix_isHadamard](#/node/turynToHadamardMatrix_isHadamard)."
  - "The order `4 * (3 * n - 1)` uses `Nat` subtraction, so it is `0` at `n = 0`."
widgets:
  - type: pipeline
    title: "Step through the construction"
    config: { preset: tt6 }
quiz:
  - q: "What are the two stages?"
    type: choice
    choices: ["[step1](#/node/step1) then [step2](#/node/step2)", "[step2](#/node/step2) then [typedGsMatrixOfTSequence](#/node/typedGsMatrixOfTSequence)", "[step2](#/node/step2) then [gsMatrix](#/node/gsMatrix) directly"]
    answer: 1
    explain: "`def turynToHadamardMatrix (T : TurynType n) : IntMat (4 * (3 * n - 1)) := typedGsMatrixOfTSequence (step2 T)`."
  - q: "What is its input?"
    type: choice
    choices: ["four `PmSeq`s and a proof", "a bundled [TurynType n](#/node/TurynType)", "a [TSequence](#/node/TSequence)"]
    answer: 1
    explain: "The record. The certificate-taking variant is [ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix), which just applies [IsTurynType.toTyped](#/node/IsTurynType.toTyped) first."
  - q: "What order of matrix does it return for `n = 2`?"
    type: number
    answer: 20
    explain: "`4 * (3 * 2 - 1) = 4 * 5 = 20`. A TT(2) exists (32 of them, by brute force in this site's JavaScript), so order-20 Hadamard matrices come out of this construction too."
---

## Plain English

```
def turynToHadamardMatrix {n : Nat} (T : TurynType n) : IntMat (4 * (3 * n - 1)) :=
  typedGsMatrixOfTSequence (step2 T)
```

The whole construction, as one function. Reading it inside out:

1. [step2](#/node/step2) `T` — lay Z, W, `(X+Y)/2` and `(X−Y)/2` along `3n − 1` positions, giving a
   [T-sequence](#/node/TSequence).
2. [gsDataOfTSequence](#/node/gsDataOfTSequence) — add and subtract the four rows, giving four ±1
   vectors of length `3n − 1`.
3. [gsMatrix](#/node/gsMatrix) — put their [circulants](#/node/circulant) into the Goethals–Seidel
   array, `4 × 4` blocks of size `3n − 1`, so order `4(3n − 1)`.

(Steps 2 and 3 are packaged as [typedGsMatrixOfTSequence](#/node/typedGsMatrixOfTSequence).)

Everything here computes, and the `pipeline` widget above runs exactly these stages in JavaScript
so you can watch the numbers. The proof that the output is Hadamard is
[turynToHadamardMatrix_isHadamard](#/node/turynToHadamardMatrix_isHadamard), one line away.
