---
id: PmSeq.ofList
title: "PmSeq.ofList: a list, a length proof, a sign proof"
summary: "Builds a [PmSeq n](#/node/PmSeq) from a `List Int` together with proofs that the list has length `n` and that every entry is ±1."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The `n` is implicit and determined by the expected type, while the proof `hlen : l.length = n` is explicit. That is what lets `pm! \"++--\" : PmSeq 4` work: `n` comes from the annotation and `decide` proves `4 = 4`."
  - "The carrier is `listToFin l n = fun i => l.getD i.1 0`, which uses `List.getD` with default `0`. If `hlen` were somehow false, out-of-range positions would read `0` — but `hlen` makes that unreachable, and the `pm` field is proved by showing the fetched value is a member of `l`."
  - "`hpm` is about `AllPmOneList l` (the list predicate), not [AllPmOne](#/node/AllPmOne) (the function predicate). The returned structure's `pm` field is derived from it."
quiz:
  - q: "How many explicit arguments does `PmSeq.ofList` take?"
    type: number
    answer: 3
    explain: "`(l : List Int)`, `(hlen : l.length = n)` and `(hpm : AllPmOneList l)`. The length `n` itself is implicit."
  - q: "How does `pm!` discharge the two proof arguments?"
    type: choice
    choices: ["by `native_decide`", "by `decide`, which runs in the kernel", "by `sorry`", "they are axioms"]
    answer: 1
    explain: "`macro_rules | `(pm! $s:str) => `(PmSeq.ofList (pmSeq! $s) (by decide) (by decide))`. Both are small finite checks and the kernel can do them, so `pm!` literals add no trust assumptions."
  - q: "What does the resulting `data` field look like?"
    type: choice
    choices: ["`fun i => l.get i`", "`listToFin l n`, i.e. `fun i => l.getD i.1 0`", "the list itself"]
    answer: 1
    explain: "A `PmSeq`'s carrier is a function on `Fin n`, so the list has to be re-presented as one; `List.getD` with default `0` keeps the definition total."
  - q: "If you wrote `pm! \"+++\" : PmSeq 4`, what would happen?"
    type: choice
    choices: ["it would pad with `+1`", "the length `decide` would fail, so elaboration fails", "it would panic at runtime"]
    answer: 1
    explain: "`hlen : (pmSeq! \"+++\").length = 4` is `3 = 4`, which `decide` refutes rather than proves."
---

## Plain English

```
def PmSeq.ofList (l : List Int) {n : Nat} (hlen : l.length = n) (hpm : AllPmOneList l) :
    PmSeq n :=
  { data := listToFin l n
    pm := … }
```

The bridge from a list — convenient to write — to the function-on-`Fin n` carrier that the rest of
the library uses. You hand it three things: the list, a proof it has the right length, and a proof
all its entries are ±1. It hands back a [PmSeq n](#/node/PmSeq).

The `pm` field is proved by a short argument: for `i : Fin n`, `hlen` makes `i.1 < l.length`, so
`l.getD i.1 0` is a genuine element of `l` (`List.getD_eq_getElem` plus `List.getElem_mem`), and
`hpm` applies to it.

In practice you use the `pm!` macro, which fills in the list with
[pmSeq!](#/node/pmSeq!) and both proofs with `decide`:

```
def tt6X : PmSeq 6 := pm! "----+-"
-- elaborates to PmSeq.ofList (pmSeq! "----+-") (by decide) (by decide)
```

Both `decide`s are kernel reductions on small finite data, so the eight example sequences carry no
extra trust assumptions — unlike the `native_decide` that proves they are
[Turyn-type](#/node/kharaghani_2005_tt36).

There is a parallel `SignSeq.ofList` for `{0, ±1}` entries, which the library defines but does not
use (the T-sequence components are built directly from functions).
