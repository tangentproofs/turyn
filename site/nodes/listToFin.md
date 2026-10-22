---
id: listToFin
title: "listToFin: read a list as a function on Fin n"
summary: "`listToFin l n = fun i => l.getD i.1 0` — index into a list, with `0` for out-of-range positions."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It does not check that `l` has length `n`. If it is shorter, the missing positions read `0`. Callers supply the length proof: [PmSeq.ofList](#/node/PmSeq.ofList) takes `hlen : l.length = n` and uses it to show the lookup is always in range."
  - "Same `0` default as [lookupNat](#/node/lookupNat), for the same total-function reason."
quiz:
  - q: "What is `listToFin [1, -1] 4` at index 3?"
    type: number
    answer: 0
    explain: "`List.getD` returns the default `0` past the end of the list. `PmSeq.ofList`'s length hypothesis is what rules this out in practice."
  - q: "Which function does it use to index?"
    type: choice
    choices: ["`List.get`", "`List.getD`, with default `0`", "`List.getElem!`"]
    answer: 1
    explain: "`fun i => l.getD i.1 0`. Using `getD` avoids needing a bounds proof inside the definition."
  - q: "Where does the bounds proof come from in [PmSeq.ofList](#/node/PmSeq.ofList)?"
    type: choice
    choices: ["it is not needed", "from `hlen : l.length = n` plus `i.2 : i.1 < n`", "from `decide`"]
    answer: 1
    explain: "`have hi : i.1 < l.length := by rw [hlen]; exact i.2`, which lets `List.getD_eq_getElem` fire and the fetched value be shown a member of `l`."
---

## Plain English

```
def listToFin (l : List Int) (n : Nat) : Fin n → Int :=
  fun i => l.getD i.1 0
```

The carrier a [PmSeq](#/node/PmSeq) built from a list actually holds. Like
[lookupNat](#/node/lookupNat), it is total: out of range it gives `0` rather than requiring a
proof.

The honesty is restored by its caller. [PmSeq.ofList](#/node/PmSeq.ofList) takes a proof that the
list has length exactly `n`, so for every `i : Fin n` the lookup is in range, and the value fetched
is a genuine element of the list — which is what lets the ±1 condition transfer from
[AllPmOneList](#/node/AllPmOneList) to [AllPmOne](#/node/AllPmOne).
