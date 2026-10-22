---
id: charToPm?
title: "charToPm?: one character to ±1"
summary: "`charToPm? c` is `some 1` for `'+'`, `some (-1)` for `'-'`, and `none` otherwise."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "The character set is exactly `+` and `-`. No whitespace, no `1`/`0`, no Unicode minus sign — a literal written with `−` (U+2212) instead of `-` would fail."
quiz:
  - q: "What is `charToPm? '-'`?"
    type: text
    answer: ["some (-1)", "some -1", "-1"]
    explain: "`if c = '+' then some 1 else if c = '-' then some (-1) else none`."
  - q: "What is `charToPm? '0'`?"
    type: text
    answer: ["none", "None"]
    explain: "Only `+` and `-` are recognized, so `pmSeq?` will fail on the whole string."
  - q: "Would a literal written with the Unicode minus sign `−` parse?"
    type: choice
    choices: ["yes", "no — only the ASCII hyphen `-` is accepted"]
    answer: 1
    explain: "`c = '-'` is a test against the ASCII character. The library's own literals all use ASCII; the docstrings use `−` only in prose."
---

## Plain English

```
def charToPm? (c : Char) : Option Int :=
  if c = '+' then some 1
  else if c = '-' then some (-1)
  else none
```

The bottom of the `pm!` literal machinery: one character in, one signed unit out, or failure.
[pmSeq?](#/node/pmSeq?) folds it over a string, and [pmSeq!](#/node/pmSeq!) turns failure into a
panic.
