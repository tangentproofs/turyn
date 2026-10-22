---
id: Result.tt_implies_hadamard
title: "Four good sequences give a Hadamard matrix of order 4(3n − 1)"
summary: "From any certificate that `X, Y, Z, W` are Turyn-type of length `n`, the library builds a square matrix of order `4 * (3 * n - 1)` whose entries are ±1 and which satisfies `H · Hᵀ = (4(3n − 1)) · I`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The Lean says `∃ H`, but the proof is fully constructive: the witness is `Turyn.ofIsTurynTypeMatrix h`, an actual matrix you can evaluate. Nothing is chosen classically here."
  - "`n` is an arbitrary `Nat` with no lower bound, so the degenerate cases are included. At `n = 0` both subtractions truncate: `W : PmSeq (0 - 1) = PmSeq 0`, the hypothesis is vacuous, and the order is `4 * (3 * 0 - 1) = 4 * 0 = 0`, so the theorem produces the empty 0 × 0 matrix, which satisfies `IsHadamardMat` trivially. Read as a statement about *interesting* Hadamard matrices, it needs `n ≥ 1`; the Lean does not say that."
  - "This theorem is one half of what a reader usually wants. It does not say which orders are reachable, that TT(n) exists for any particular `n`, or that the matrix it builds is new or unique. Existence of the input is a separate matter — see [kharaghani_2005_tt36](#/node/kharaghani_2005_tt36)."
  - "`#print axioms` on this theorem reports only `propext`, `Classical.choice`, `Quot.sound`. That is because it is a statement about every `n`, with no computation in it. The concrete examples are a different story — see [#/trust](#/trust)."
  - "The 'Why it matters' section below mentions the Hadamard conjecture and the history of order 428. That is background from the literature; none of it is stated or proved in the Lean."
widgets:
  - type: pipeline
    title: "The whole construction, one stage at a time"
    config: { preset: tt6 }
  - type: outline
    title: "How the proof goes"
    config:
      steps:
        - text: "Bundle the certificate: IsTurynType.toTyped turns h into a TurynType n record"
          link: "IsTurynType.toTyped"
        - text: "step2: lay Z, W, (X+Y)/2 and (X−Y)/2 out along 3n − 1 positions — a T-sequence"
          link: "step2"
        - text: "tseqCombine1..4: add and subtract the four rows to get four ±1 vectors of length 3n − 1"
          link: "tseqCombine_periodic_identity"
        - text: "gsMatrix: put their circulants into the Goethals–Seidel 4 × 4 block array"
          link: "gsMatrix"
        - text: "typedGsMatrix_isHadamard: the block algebra gives H · Hᵗ = 4(3n − 1) · I"
          link: "typedGsMatrix_isHadamard"
          hard: true
        - text: "Package the pair (matrix, proof) as the existential"
          link: "ofIsTurynTypeMatrix_isHadamard"
quiz:
  - q: "What is the order of the matrix this theorem produces from a TT(36)?"
    type: number
    answer: 428
    explain: "`4 * (3 * 36 - 1) = 4 * 107 = 428`. That number is also recorded separately as `kh05_hadamard_order : hadamardOrder 36 = 428`."
  - q: "What does the theorem assume about `n`?"
    type: choice
    choices: ["nothing at all — any `Nat`", "`n ≥ 1`", "`n` is even", "`n ≥ 4`"]
    answer: 0
    explain: "The binder is just `{n : Nat}`. The only hypothesis is `h : IsTurynType X Y Z W`. Compare [energy_identity](#/node/energy_identity), which does ask for `n ≥ 1`."
  - q: "At `n = 0`, what order does `4 * (3 * n - 1)` denote in Lean?"
    type: number
    answer: 0
    explain: "`Nat` subtraction truncates: `3 * 0 - 1 = 0 - 1 = 0`, so the order is `4 * 0 = 0`. The theorem is true but vacuous there — the 0 × 0 matrix has no entries to be ±1 and `H * Hᵀ = 0 • 1` holds."
  - q: "True or false: the theorem proves that Hadamard matrices of order `4(3n − 1)` can *only* be built this way."
    type: choice
    choices: ["True", "False"]
    answer: 1
    explain: "False. It is a one-directional existence statement: a TT(n) certificate implies some Hadamard matrix of that order exists. Nothing is claimed about other constructions, or about orders not of this shape."
  - q: "Which length does `W` have in the hypothesis?"
    type: choice
    choices: ["`n`", "`n - 1`, with `Nat` subtraction", "`3 * n - 1`", "`2 * n - 1`"]
    answer: 1
    explain: "`{W : PmSeq (n - 1)}`. X, Y and Z have length `n`; W is one shorter, and at `n = 0` that reads `PmSeq 0` rather than an error, because `Nat` subtraction stops at 0."
  - q: "Is the witness matrix computable from the hypothesis, or only known to exist?"
    type: choice
    choices: ["only known to exist, by a classical argument", "computable: it is `ofIsTurynTypeMatrix h`", "computable, but only for even `n`"]
    answer: 1
    explain: "`Results.lean` proves it as `⟨Turyn.ofIsTurynTypeMatrix h, Turyn.ofIsTurynTypeMatrix_isHadamard h⟩` — the pair of a definition and its correctness theorem. [tt6_hadamard](#/node/tt6_hadamard) is that matrix, written down."
---

## ELI5

Write down four rows of pluses and minuses. Slide each row along itself, multiply the overlapping
boxes, add them up, and add the four answers together with Z and W counted twice. If you get zero
every single time you slide, then those four little rows are a recipe for a big square of pluses
and minuses whose rows are all at right angles to each other. The square has `4(3n − 1)` rows,
which for four rows of length 36 is 428. This theorem is the recipe, checked by machine.

## Plain English

This is the main theorem of the library, and the first of the two statements the comparator
challenge asks for.

**Input.** Three ±1 sequences `X, Y, Z` of length `n` and one of length `n - 1`, called `W`
(the types [PmSeq n](#/node/PmSeq) and `PmSeq (n - 1)` carry the ±1 condition), plus a proof
`h` that they are [IsTurynType](#/node/IsTurynType): at every lag `s` with `1 ≤ s < n`, the
combined autocorrelation `N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s)` is zero.

**Output.** Some `H : IntMat (4 * (3 * n - 1))` with [IsHadamardMat H](#/node/IsHadamardMat),
which unfolds to two things: every entry is `1` or `-1`, and `H * Hᵀ = (4(3n − 1)) • I`.

That is the whole statement. It is a bare implication — no claim that a TT(n) exists for any
particular `n`, and no claim about which orders are reachable. Feeding it a real TT(36) is what
[hadamard_428_exists](#/node/hadamard_428_exists) and
[kharaghani_2005_tt36](#/node/kharaghani_2005_tt36) are for.

## In the Lean

```
theorem tt_implies_hadamard {n : Nat} {X Y Z : PmSeq n} {W : PmSeq (n - 1)}
    (h : IsTurynType X Y Z W) :
    ∃ H : IntMat (4 * (3 * n - 1)), IsHadamardMat H :=
  ⟨Turyn.ofIsTurynTypeMatrix h, Turyn.ofIsTurynTypeMatrix_isHadamard h⟩
```

The proof is a pair. The first component is a *definition*,
[ofIsTurynTypeMatrix](#/node/ofIsTurynTypeMatrix), that actually builds the matrix; the second is
the theorem [ofIsTurynTypeMatrix_isHadamard](#/node/ofIsTurynTypeMatrix_isHadamard) that it works.
The existential is just the shape `Challenge.lean` asks for.

Note the two `Nat` subtractions. `n - 1` is the length of `W`, and `3 * n - 1` is the length of
the T-sequence; both truncate at 0 rather than going negative. For every `n ≥ 1` they mean what
you expect.

## Why it matters

The Hadamard conjecture asks for a ±1 matrix with orthogonal rows at every order divisible by 4.
Order 428 was the smallest open case until 2005, and the construction behind the answer is exactly
this chain: find four short sequences by search, then let the algebra blow them up into a big
matrix. The search is the hard part computationally; this theorem is the part that has to be right
mathematically, and here it is machine-checked for every `n` at once.
