# Lean Formal Verification for Turyn-Type Sequences

Machine-checked proofs that a given set of ±1 sequences form a valid Turyn-type
quadruple TT(n), plus a constructive pipeline that turns any TT(n) into an
explicit Hadamard matrix of order `4(3n − 1)`.

## Quick start

```bash
# Install Lean 4 (if not already installed)
curl -sSf https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh | sh

# Build and verify all proofs
cd lean
lake build
```

The build compiles all definitions and checks all proofs, including the
`native_decide` verification of the Kharaghani TT(36) sequences.

Toolchain: `leanprover/lean4:v4.28.0`, Mathlib `v4.28.0`.

## Proof status

The library adds **no project-specific axioms**. The general theorems
(`energy_identity`, `tt_implies_hadamard`, `xy_interior_antipalindrome`,
`canonical_representative_exists`, …) use only Lean's three standard axioms
(`propext`, `Quot.sound`, `Classical.choice`). The concrete-instance theorems
proved by `native_decide` (`tt6_valid`, `kharaghani_2005_tt36`, `tt6_energy`,
`tt6_sums`, `kh05_energy`, `kh05_sums`, `kh05_hadamard_order`, and the examples
built on them, `hadamard_428_exists` and `tt6_hadamard_isHadamard`) also depend
on `Lean.ofReduceBool` and `Lean.trustCompiler` (`kh05_hadamard_order` uses
only those two), i.e. they trust the Lean compiler and its native-code
evaluation, not just the kernel.

| Theorem | Status | Method |
|---------|--------|--------|
| `tt6_valid` | Proved | `native_decide` |
| `kharaghani_2005_tt36` | Proved | `native_decide` |
| `tt6_energy`, `kh05_energy` | Proved | `native_decide` |
| `tt6_sums`, `kh05_sums` | Proved | `native_decide` |
| `tt6_hadamard_isHadamard` | Proved | constructive pipeline |
| `kh05_hadamard_order` | Proved | `native_decide` |
| `hadamard_428_exists` | Proved | from `kharaghani_2005_tt36` |
| `turyn_vanishing_total` | Proved | direct from TT vanishing |
| `sum_sq_eq_len_add_two_totalAutocorr` | Proved | sum-square expansion |
| `weightedTotalAutocorr_decompose` | Proved | `Finset.sum` linearity |
| `energy_identity` | Proved | sum-sq identity + vanishing total |
| `step2_periodic` (T-sequence vanishing) | Proved | per-component aperiodic identities |
| `typedGsMatrix_isHadamard` | Proved | circulant matrix algebra |
| `turynToHadamardMatrix_isHadamard` | Proved | composition of the two above |
| `xy_product_law` (XY interior anti-palindrome) | Proved | strong induction |
| `canonical_representative_exists` | Proved | six-step BDKR normalization |
| `Turyn.Result.tt_implies_hadamard` | Proved | wrapper around `ofIsTurynTypeMatrix*` |
| `Turyn.Result.xy_interior_antipalindrome` | Proved | wrapper around `xy_product_law` |

## Architecture

```
Defs.lean            Trusted definitions referenced in Challenge.lean:
                     PmSeq, SignSeq, AllPmOne, aperiodicAutocorr,
                     combinedAutocorr, TurynType, IsTurynType,
                     1-indexed accessors (xAt/yAt/zAt/wAt/uAt),
                     Canonical1..6, IntVec/IntMat/IsHadamardMat.
Challenge.lean       Comparator challenge module — headline statements
                     stated with `sorry` in the `Turyn.Result` namespace.
Results.lean         Comparator solution module — headline proofs
                     re-exposed from the Turyn library.
comparator-config.json  Comparator configuration.

Turyn/
├── Defs.lean             (see above; root of the import graph)
├── TurynType.lean        Boolean / decidability layer, `pm! "..."`
│                         literal parser, `IsTurynType` decidable
│                         instance, `IsTurynType.toTyped`, `seqSum`,
│                         `PmSeq.toList` view + simp lemmas.
├── PmSum.lean            Parity / mod-2 lemmas for ±1 sums.
├── Energy.lean           Energy identity x² + y² + 2z² + 2w² = 6n − 2.
│                         Proves `turyn_vanishing_total`,
│                         `weightedTotalAutocorr_decompose`,
│                         `sum_sq_eq_len_add_two_totalAutocorr`,
│                         `energy_identity`, plus `checkEnergy` for
│                         `native_decide` checks.
├── BaseSequence.lean     Typed signed sequences and the standard
│                         (A, B, C, D) base-sequence construction
│                         from a Turyn-type input, with the combined
│                         aperiodic autocorrelation identity.
├── TSequence.lean        Function-typed `TSequence m`, `step2`
│                         construction (Z, W, (X+Y)/2, (X−Y)/2),
│                         disjoint-support and periodic-vanishing
│                         proofs, `hadamardOrder n = 4(3n − 1)`.
├── MatUtils.lean         Circulants, reversal matrix `R`, and small
│                         matrix lemmas used by Goethals–Seidel.
├── GoethalsSeidel.lean   Typed Goethals–Seidel array `gsMatrix`,
│                         block reindexing, circulant-algebra
│                         identities, and `typedGsMatrix_isHadamard`.
├── Hadamard.lean         Top-level constructive interface:
│                         `turynToHadamardMatrix`, `ofIsTurynTypeMatrix`,
│                         and their Hadamard-property theorems.
├── Equivalence.lean      Elementary transformations T1..T4, the
│                         six-step BDKR normalization, and
│                         `canonical_representative_exists`.
├── XY.lean               XY product law (interior anti-palindrome):
│                         `xy_product_law` for canonical TT(n) of
│                         length `n ≥ 4`.
└── Examples.lean         TT(6) and the Kharaghani–Tayfeh-Rezaie
                          TT(36), each with `native_decide` validity,
                          energy, sum, and (for TT(6)) the constructive
                          Hadamard matrix `tt6_hadamard : IntMat 68`.
```

## How to verify your own solution

After the Turyn solver finds a TT(n), add a new file:

```lean
import Turyn.TurynType
import Turyn.Energy
import Turyn.Hadamard

def myX : PmSeq N       := pm! "..."
def myY : PmSeq N       := pm! "..."
def myZ : PmSeq N       := pm! "..."
def myW : PmSeq (N - 1) := pm! "..."

-- Lean verifies at compile time (takes seconds)
theorem my_tt_valid : IsTurynType myX myY myZ myW := by native_decide

-- Constructive Hadamard matrix of order 4(3N − 1):
def myHadamard : IntMat (4 * (3 * N - 1)) :=
  Turyn.ofIsTurynTypeMatrix my_tt_valid

theorem myHadamard_isHadamard : Turyn.IsHadamardMat myHadamard :=
  Turyn.ofIsTurynTypeMatrix_isHadamard my_tt_valid
```

Then `lake build` checks everything. If the sequences are wrong, Lean rejects
the proof and the build fails.

## Mathematical background

### Turyn-type sequences

A TT(n) is a quadruple (X, Y, Z, W) of ±1 sequences with lengths (n, n, n, n−1)
satisfying

    N_X(s) + N_Y(s) + 2·N_Z(s) + 2·N_W(s) = 0    for all s = 1, …, n − 1

where `N_a(s) = Σ_{i=0}^{|a|−1−s} a_i a_{i+s}` is the aperiodic autocorrelation.

### Energy identity (proved)

The sequence sums satisfy `x² + y² + 2z² + 2w² = 6n − 2`.

**Why:** Expanding `(Σ aᵢ)² = |a| + 2·Σₛ≥₁ Nₐ(s)` for each sequence and
combining with the vanishing condition:

    LHS = (n + n + 2n + 2(n − 1)) + 2·Σₛ≥₁(N_X + N_Y + 2N_Z + 2N_W)(s)
        = (6n − 2) + 2·0 = 6n − 2

### Hadamard construction (proved end-to-end)

From TT(n), a T-sequence → Goethals–Seidel pipeline produces a Hadamard
matrix of order `4(3n − 1)`. `step2` builds the T-sequence directly from the
Turyn quadruple (it folds the classical base-sequence step into one
construction); the separate base-sequence layer in `Turyn/BaseSequence.lean`
is not used by this chain.

  1. `step2 : TurynType n → TSequence (3n − 1)` (proved support and periodic
     vanishing, see `Turyn/TSequence.lean`).
  2. `gsDataOfTSequence : TSequence m → CertifiedGSData m` and
     `typedGsMatrixOfTSequence` (`Turyn/GoethalsSeidel.lean`).
  3. `turynToHadamardMatrix` and its `*_isHadamard` theorem
     (`Turyn/Hadamard.lean`) compose 1 + 2.

Applied to the TT(36) of Kharaghani–Tayfeh-Rezaie this yields a Hadamard
matrix of order 428 via `tt_implies_hadamard`; note that the example theorem
`hadamard_428_exists` itself only states that the TT(36) is valid and that
`hadamardOrder 36 = 428`, not that the matrix exists.

### Canonical representatives (proved)

`Turyn/Equivalence.lean` formalizes the six-step normalization from
Best–Đoković–Kharaghani–Ramp (arXiv:1206.4107, 2013) using the elementary
transformations T1..T4 (negate one component, reverse one component, alternate
all four, swap A and B). The headline result `canonical_representative_exists`
states that every TT(n) of even length is equivalent to one in canonical form
(uniqueness within the orbit is not yet formalized).

## Trust model

- **Kernel-checked, except `native_decide`.** Every theorem in the library is
  discharged by ordinary Lean tactics, by structural / matrix-algebra
  reasoning, or by `native_decide`. `native_decide` compiles the Boolean check
  to native code and runs it; the kernel accepts the result via the
  `Lean.ofReduceBool` axiom, so those theorems also trust the compiler
  (`Lean.trustCompiler`).
- **No project-specific axioms.** `#print axioms` on the comparator headline
  theorems (`tt_implies_hadamard`, `xy_interior_antipalindrome`) reports only
  Lean's standard `propext`, `Quot.sound`, and `Classical.choice` — the set
  permitted by `comparator-config.json`. The `native_decide` instance theorems
  above additionally report `Lean.ofReduceBool` and `Lean.trustCompiler`.

## Comparator-checkable headline results

The headline theorems are exposed in a layout consumable by
[`leanprover/comparator`](https://github.com/leanprover/comparator):

```
Challenge.lean            -- challenge module: theorem statements with `sorry`
Results.lean              -- solution module: the headline-theorem proofs
comparator-config.json    -- comparator configuration
```

The headline names live in the `Turyn.Result` namespace and are:

- `Turyn.Result.tt_implies_hadamard` —
  if a TT(n) exists, a Hadamard matrix of order `4(3n − 1)` exists.
- `Turyn.Result.xy_interior_antipalindrome` —
  for a canonical TT(n) of length `n ≥ 4`, `uAt S (n + 1 − k) = − uAt S k`
  for every `2 ≤ k ≤ n − 1` (the XY product law, discovered by codex).

Run comparator from the `lean/` directory after installing `landrun` and
`lean4export` (see the comparator README) with:

```bash
lake env <path-to-comparator-binary> comparator-config.json
```

## References

- Kharaghani & Tayfeh-Rezaie (2005). A Hadamard matrix of order 428.
  *J. Combin. Des.* 13(6), 435–440.
- Best, Đoković, Kharaghani, Ramp (2013). Turyn-type sequences:
  Classification, Enumeration and Construction. arXiv:1206.4107.
- Goethals & Seidel (1967). Orthogonal matrices with zero diagonal.
  *Can. J. Math.* 19, 1001–1010.
