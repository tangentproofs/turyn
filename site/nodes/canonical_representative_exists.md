---
id: canonical_representative_exists
title: "Every even-length TT(n) can be normalized"
summary: "For even `n ≥ 2`, every Turyn-type quadruple can be transformed, by a finite chain of the ten elementary moves, into one satisfying all six BDKR canonical conditions."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**Existence only.** The theorem produces *some* canonical `T` reachable from `S`. It does not say the canonical form is unique, and it does not say two quadruples with the same canonical form are equivalent. Uniqueness within an orbit is not formalized anywhere in the library."
  - "**[Equivalent](#/node/Equivalent) is not proved to be an equivalence relation.** It is defined as `Relation.ReflTransGen (Elementary n)` — reflexive and transitive by construction, and `equivalent_trans` is the only closure lemma proved. Symmetry is true mathematically (each move is an involution or has an inverse among the ten) but the Lean does not prove it, so 'equivalence class' in the docstring is looser than what is established. Read the conclusion as 'reachable from `S` by a finite chain of moves'."
  - "Both hypotheses are used: `hn_even : n % 2 = 0` is needed by steps 1 and 6, and `hn : 2 ≤ n` throughout. At `n = 1` the condition is in fact unsatisfiable: `W : PmSeq 0`, so `wAt S 1` reads out of range and returns `0`, and [Canonical1](#/node/Canonical1) can never hold."
  - "The reference to Best–Đoković–Kharaghani–Ramp and their enumeration of small TT(n) is background from arXiv:1206.4107, not something the Lean states. What the Lean formalizes is the six conditions and the reachability theorem."
  - "Whether every *odd*-length TT(n) can be normalized is not addressed. (Separately, the [XY law](#/node/Result.xy_interior_antipalindrome) implies no `Canonical1` TT(n) exists for odd `n ≥ 5` at all — but the Lean does not draw that conclusion.)"
widgets:
  - type: moves
    title: "Press the ten moves and watch Canonical1"
    config: { preset: tt6 }
  - type: outline
    title: "The six normalization steps"
    config:
      steps:
        - text: "Step 1a — negate X, Y, Z or W to make x₁, y₁, z₁, w₁ all +1 (four independent moves)"
          link: "Canonical1"
        - text: "Step 1b — the vanishing condition at lag n−1 now reads xₙ + yₙ + 2zₙ = 0, so xₙ and yₙ are equal"
          note: "endpoint_relation. For ±1 values the only solutions are (1, 1, −1) and (−1, −1, 1), which is also why zₙ = −1 under Canonical1 (lemma1_endpoint_constraint)."
        - text: "Step 1c — if both are −1, alternate all four: that fixes position n and leaves position 1 alone"
          note: "Needs n even: altSeqFn multiplies entry i (0-indexed) by (−1)ⁱ, so it flips position n exactly when n − 1 is odd."
        - text: "Step 2 — the first index where X disagrees with its reverse: reverse X if needed"
          link: "Canonical2"
        - text: "Step 3 — the same for Y"
          link: "Canonical3"
        - text: "Step 4 — the first index where Z agrees with its reverse: negate-and-reverse Z"
          link: "Canonical4"
        - text: "Step 5 — the first exceptional index of W"
          link: "Canonical5"
        - text: "Step 6 — break the X/Y tie by swapping them if necessary"
          link: "Canonical6"
          hard: true
quiz:
  - q: "Which hypotheses does the theorem make about `n`?"
    type: choice
    choices: ["`n ≥ 4`", "`n % 2 = 0` and `2 ≤ n`", "`n` odd", "none"]
    answer: 1
    explain: "`(hn_even : n % 2 = 0) (hn : 2 ≤ n)`. Even length and at least 2."
  - q: "What exactly is produced?"
    type: choice
    choices: ["a unique canonical representative", "some `T` with `Equivalent n S T` and `Canonical n T`", "a proof that `S` itself is canonical", "a decision procedure"]
    answer: 1
    explain: "`∃ T : TurynType n, Equivalent n S T ∧ Canonical n T`. Nothing about uniqueness."
  - q: "`Equivalent n S T` is defined as what?"
    type: choice
    choices: ["an `Equiv` between the two records", "`Relation.ReflTransGen (Elementary n) S T`", "equality of the four sequences", "`Canonical n S ↔ Canonical n T`"]
    answer: 1
    explain: "The reflexive–transitive closure of the ten one-step [Elementary](#/node/Elementary) moves. Symmetry is not part of the definition and is not proved."
  - q: "How many conditions does [Canonical](#/node/Canonical) bundle?"
    type: number
    answer: 6
    explain: "`Canonical1 ∧ Canonical2 ∧ Canonical3 ∧ Canonical4 ∧ Canonical5 ∧ Canonical6`."
  - q: "True or false: the theorem shows two quadruples with the same canonical form are equivalent."
    type: choice
    choices: ["True", "False"]
    answer: 1
    explain: "False. That would need uniqueness of the canonical form plus symmetry of `Equivalent`, neither of which is formalized here."
---

## Plain English

Turyn-type quadruples come in families. You can negate any one of the four sequences, reverse any
one of them, multiply every entry of all four by `(−1)ⁱ`, or swap X with Y — ten moves in all
([Elementary](#/node/Elementary)) — and the vanishing condition survives every one. So the
quadruples naturally sit in clumps, and a search program wants one representative per clump
rather than all of them.

This theorem says a representative in **normal form** is always reachable, for even `n ≥ 2`: some
finite chain of the ten moves leads from your quadruple to one satisfying all six conditions
`Canonical1 … Canonical6` of Best–Đoković–Kharaghani–Ramp.

The six conditions are a cascade of tie-breakers:

1. The six endpoint entries `x₁, xₙ, y₁, yₙ, z₁, w₁` are all `+1`.
2. At the first position where X differs from its own reverse, X is `+1`.
3. The same for Y.
4. At the first position where Z *agrees* with its reverse, Z is `+1`.
5. The analogous rule for W.
6. If X and Y are still interchangeable, a comparison at position 2 (or `n − 1`) decides which is
   which.

Each step is proved by a separate lemma (`step1_condition1 … step6_condition6`) that applies a few
moves, re-establishes the earlier conditions, and adds the new one. The headline theorem chains
the six together with `equivalent_trans`.

## In the Lean

```
theorem canonical_representative_exists
    (n : Nat) (hn_even : n % 2 = 0) (hn : 2 ≤ n) (S : TurynType n) :
    ∃ T : TurynType n, Equivalent n S T ∧ Canonical n T
```

Two cautions about how much this says. First, it is an existence statement: nothing here is a
*unique* normal form, so you cannot use it to decide whether two quadruples are related. Second,
`Equivalent` is only the reflexive–transitive closure of the moves; the library never proves it
symmetric, so "equivalence class" in the docstring is a mathematical reading rather than a formal
one. The honest reading of the conclusion is: *you can get from `S` to a canonical `T`*.

## Why it matters

Classification work (BDKR enumerated the TT(n) for small `n`) and search programs both need to
know that normalizing is harmless and always possible. The second half — that normalizing is
harmless — is what the `vanishing_*` lemmas behind [Elementary](#/node/Elementary) give you; this
theorem is the first half.
