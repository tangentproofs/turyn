---
id: AllPmOneList
title: "AllPmOneList: ±1, for lists"
summary: "`AllPmOneList a` is `∀ v ∈ a, v = 1 ∨ v = -1` — the list version of [AllPmOne](#/node/AllPmOne)."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "It quantifies over *membership*, not over indices. That is what makes the `Bool` mirror `allPmOne a = a.all …` easy to relate to it (`allPmOne_iff`), and so what makes `pm!` literals decidable by `decide`."
  - "It is a `Prop`; the decidability instance comes from `allPmOne_iff`."
quiz:
  - q: "What does it quantify over?"
    type: choice
    choices: ["indices `i < a.length`", "members `v ∈ a`", "both"]
    answer: 1
    explain: "`∀ v ∈ a, v = 1 ∨ v = -1`. The index-based version is [AllPmOne](#/node/AllPmOne) on `Fin n → Int`."
  - q: "What is `AllPmOneList []`?"
    type: choice
    choices: ["true, vacuously", "false", "undecidable"]
    answer: 0
    explain: "No members to check. This is what makes `pm! \"\" : PmSeq 0` elaborate."
  - q: "How is it decided?"
    type: choice
    choices: ["by `native_decide`", "via `allPmOne_iff`, which relates it to the `Bool` check `a.all fun v => v == 1 || v == -1`", "it is not decidable"]
    answer: 1
    explain: "`instance (a : List Int) : Decidable (AllPmOneList a) := decidable_of_iff _ (allPmOne_iff a)`. The kernel can run that check on a literal."
---

## Plain English

```
def AllPmOneList (a : List Int) : Prop := ∀ v ∈ a, v = 1 ∨ v = -1
```

The ±1 condition for lists, which is the form [PmSeq.ofList](#/node/PmSeq.ofList) takes as its
third argument.

Why a separate predicate from [AllPmOne](#/node/AllPmOne)? Because the decidable `Bool` mirror
`allPmOne` is naturally written with `List.all`, and `List.all_eq_true` matches a membership
quantifier directly. The chain is:

```
allPmOne a = true  ↔  AllPmOneList a      (allPmOne_iff, by simp)
Decidable (AllPmOneList a)                 (decidable_of_iff)
```

and that instance is what `pm!`'s second `by decide` uses. There is a parallel
`AllSignOneList` / `allSignOne` / `allSignOne_iff` trio for `{0, ±1}`.
