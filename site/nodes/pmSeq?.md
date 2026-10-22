---
id: pmSeq?
title: "pmSeq?: parse a whole string, or fail"
summary: "`pmSeq? s` returns `some` list of ±1 values if every character of `s` is `+` or `-`, and `none` otherwise."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "All-or-nothing: a single bad character makes the whole result `none`, because the fold propagates failure."
  - "It returns a `List Int` with no length information. The length is checked later, by `pm!`'s first `decide` against [PmSeq.ofList](#/node/PmSeq.ofList)."
quiz:
  - q: "What is `pmSeq? \"\"` (the empty string)?"
    type: text
    answer: ["some []", "some ([])", "some nil", "some List.nil", "Option.some []"]
    explain: "The fold's initial value is `some []`. That is how `pm! \"\" : PmSeq 0` would work — relevant because `W : PmSeq (n - 1)` is empty at `n = 1`."
  - q: "What is `pmSeq? \"+ -\"` (with a space)?"
    type: text
    answer: ["none", "None", "Option.none", "none, because a space is neither + nor -"]
    explain: "The space is not `+` or `-`, so [charToPm?](#/node/charToPm?) returns `none` and the fold propagates it."
  - q: "Does it know the intended length?"
    type: choice
    choices: ["yes", "no — it just returns a list"]
    answer: 1
    explain: "The length obligation belongs to [PmSeq.ofList](#/node/PmSeq.ofList); `pm!` discharges it by `decide`, so a mis-counted literal is an elaboration error."
---

## Plain English

```
def pmSeq? (s : String) : Option (List Int) :=
  s.toList.foldr
    (fun c acc => match charToPm? c, acc with
      | some x, some xs => some (x :: xs)
      | _, _ => none)
    (some [])
```

A right fold over the characters, carrying an `Option`: each character is converted by
[charToPm?](#/node/charToPm?), and any failure anywhere makes the whole result `none`.

This is the safe version; [pmSeq!](#/node/pmSeq!) is the one the `pm!` macro calls, which panics
rather than returning an option.
