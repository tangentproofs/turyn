---
id: pmSeq!
title: "pmSeq!: parse a string of + and − into a list"
summary: "`pmSeq! s` turns a string of `+` and `-` characters into a `List Int` of `1`s and `-1`s, and panics on anything else."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The failure mode is `panic!`, not a compile error: a bad character makes `pmSeq! s` evaluate to `default` (the empty list) with a message, rather than being rejected by the elaborator. In practice a wrong character shows up immediately anyway, because the surrounding `pm!` macro then fails its `decide` for the length."
  - "This is only the parse step. It produces a `List Int`, with no length or ±1 guarantee in its type; [PmSeq.ofList](#/node/PmSeq.ofList) adds both."
  - "The `pm!` *macro* is a separate thing (a `syntax` + `macro_rules` pair in `Turyn/TurynType.lean`, not a declaration with a node here): `pm! \"..\"` expands to `PmSeq.ofList (pmSeq! \"..\") (by decide) (by decide)`."
quiz:
  - q: "What is `pmSeq! \"+-\"`?"
    type: text
    answer: ["[1, -1]", "[1,-1]"]
    explain: "`+` maps to `1` and `-` to `-1`, via `charToPm?`, folded right over `s.toList`."
  - q: "What happens with `pmSeq! \"+x-\"`?"
    type: choice
    choices: ["a type error at elaboration", "`pmSeq?` returns `none`, so `pmSeq!` panics when evaluated", "the `x` is skipped"]
    answer: 1
    explain: "`def pmSeq! (s : String) : List Int := match pmSeq? s with | some xs => xs | none => panic! …`. `pmSeq?` is the `Option`-valued parser that returns `none` on any character other than `+` or `-`."
  - q: "Does `pmSeq!` know how long the result should be?"
    type: choice
    choices: ["yes, from the type", "no — it returns a `List Int`, and the length is checked later by `pm!`'s first `decide`"]
    answer: 1
    explain: "The length obligation `l.length = n` is an argument of [PmSeq.ofList](#/node/PmSeq.ofList); `pm!` discharges it with `decide`, so a literal of the wrong length is a genuine elaboration failure."
---

## Plain English

The string-to-list half of the `pm!` notation.

```
def charToPm? (c : Char) : Option Int :=
  if c = '+' then some 1 else if c = '-' then some (-1) else none

def pmSeq? (s : String) : Option (List Int) := …   -- fails on any other character

def pmSeq! (s : String) : List Int :=
  match pmSeq? s with
  | some xs => xs
  | none => panic! s!"invalid ±1 literal: {s}"
```

So `pmSeq! "----+-"` is `[-1, -1, -1, -1, 1, -1]`.

The `!` is Lean's convention for "may panic". That is not a problem here, because `pmSeq!` is only
ever used inside the `pm!` macro, which immediately asks `decide` to confirm the length and the
±1-ness of the result:

```
macro_rules
  | `(pm! $s:str) => `(PmSeq.ofList (pmSeq! $s) (by decide) (by decide))
```

A typo in a literal therefore fails loudly at elaboration time (the length `decide` will not close),
rather than silently producing a shorter sequence.
