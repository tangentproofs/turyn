---
id: Equivalent
title: "Equivalent: reachable by a chain of moves"
summary: "`Equivalent n S T` is `Relation.ReflTransGen (Elementary n) S T` — there is a finite chain of elementary moves leading from `S` to `T`."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "**It is not proved to be an equivalence relation.** `Relation.ReflTransGen` is reflexive and transitive by construction, and `equivalent_trans` records the transitivity; symmetry is never stated or proved. Mathematically each move is invertible, so the relation *is* symmetric, but you cannot cite the Lean for that. Read `Equivalent n S T` as 'T is reachable from S'."
  - "Consequently, phrases like 'every equivalence class has a canonical representative' in the docstrings are a mathematical gloss. What [canonical_representative_exists](#/node/canonical_representative_exists) proves is: from any `S`, some canonical `T` is reachable."
  - "No bound is placed on the length of the chain. (In the normalization proof it is at most about a dozen moves, but that is not part of the statement.)"
widgets:
  - type: moves
    title: "Build your own chain"
    config: { preset: tt6 }
quiz:
  - q: "`Equivalent n S T` unfolds to what?"
    type: choice
    choices: ["`Elementary n S T`", "`Relation.ReflTransGen (Elementary n) S T`", "`S = T`", "`Canonical n S ↔ Canonical n T`"]
    answer: 1
    explain: "The reflexive–transitive closure of the one-step relation."
  - q: "Is `Equivalent n S S` true?"
    type: choice
    choices: ["yes, by `ReflTransGen.refl`", "no, you must apply at least one move"]
    answer: 0
    explain: "Reflexivity is one of the two constructors of `ReflTransGen`, and `step1_condition1` uses it in exactly the cases where no move is needed."
  - q: "Which closure property does the library prove?"
    type: choice
    choices: ["symmetry", "transitivity (`equivalent_trans`)", "both", "neither"]
    answer: 1
    explain: "`theorem equivalent_trans (n) : Equivalent n S T → Equivalent n T U → Equivalent n S U := Relation.ReflTransGen.trans`. It is what chains the six normalization steps together."
  - q: "Does `Equivalent n S T` imply `IsTurynType` is preserved?"
    type: choice
    choices: ["yes — but trivially, since both `S` and `T` are `TurynType n` values and so carry their own proofs", "no", "only for even `n`"]
    answer: 0
    explain: "The vanishing condition is a *field* of [TurynType n](#/node/TurynType), so any value of that type satisfies it. The content is in the `do*` constructors being definable at all, which is what the `vanishing_*` lemmas give."
---

## Plain English

```
def Equivalent (n : Nat) (S T : TurynType n) : Prop :=
  Relation.ReflTransGen (Elementary n) S T
```

Mathlib's `Relation.ReflTransGen r` is the smallest reflexive, transitive relation containing `r`:
you can get from `S` to `T` in zero or more single steps. Here the single steps are the ten
[Elementary](#/node/Elementary) moves.

Three facts are available:

- `Relation.ReflTransGen.refl` — zero moves;
- `Elementary.toEquivalent` — one move;
- `equivalent_trans` — glue two chains.

Those are exactly what `canonical_representative_exists` needs: each of its six steps produces a
short chain, and `equivalent_trans` concatenates them.

## The missing half

Symmetry is not there. Every move is invertible — `negX`, `revX`, `altAll` and `swap` are their
own inverses when applied twice — so the relation really is symmetric, and "equivalence class" is
the right mathematical picture. But the Lean proves only reflexivity and transitivity, so a
careful reading of any statement involving `Equivalent` should say *reachable from*, not
*in the same class as*. Proving symmetry would mean showing each move is undone by another — for
instance `S.doNegX.doNegX = S`, which needs `PmSeq` extensionality — for all ten. Easy, but not
done.
