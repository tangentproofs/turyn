---
id: hadamardOrder
title: "hadamardOrder n = 4(3n − 1)"
summary: "The order of the Hadamard matrix the Turyn pipeline builds from a TT(n), as a named `Nat → Nat` function."
review: draft
authors: ["claude (for @tangentstorm)"]
caveats:
  - "`Nat` subtraction. At `n = 0` this is `4 * (0 - 1) = 4 * 0 = 0`, not a negative number and not an error."
  - "It is only a name for the arithmetic. The constructive theorems carry the formula `4 * (3 * n - 1)` in their types directly and never mention `hadamardOrder`; the only declarations that use it are `kh05_hadamard_order` and [hadamard_428_exists](#/node/hadamard_428_exists)."
  - "Nothing here proves that `4(3n − 1)` is divisible by 4 in a useful sense, or that these are the only orders reachable."
quiz:
  - q: "`hadamardOrder 36 = ?`"
    type: number
    answer: 428
    explain: "`4 * (3 * 36 - 1) = 4 * 107 = 428`. That is `kh05_hadamard_order`, proved by `native_decide`."
  - q: "`hadamardOrder 6 = ?`"
    type: number
    answer: 68
    explain: "`4 * (3 * 6 - 1) = 4 * 17 = 68` — the order of [tt6_hadamard](#/node/tt6_hadamard)."
  - q: "`hadamardOrder 0 = ?`"
    type: number
    answer: 0
    explain: "`3 * 0 - 1` truncates to `0` in `Nat`, so the answer is `4 * 0 = 0`, not `-4`."
  - q: "`hadamardOrder 1 = ?`"
    type: number
    answer: 8
    explain: "`4 * (3 - 1) = 8`. And a TT(1) always exists, because the vanishing condition is vacuous there — so the pipeline does produce an 8 × 8 Hadamard matrix from `(+, +, +, empty)`."
---

## Plain English

```
def hadamardOrder (n : Nat) : Nat := 4 * (3 * n - 1)
```

The length of the T-sequence built by [step2](#/node/step2) is `3n − 1`, and the Goethals–Seidel
array stacks four `(3n − 1) × (3n − 1)` blocks in each direction, giving `4(3n − 1)`.

Small values:

| n | 3n − 1 | order |
|---|---|---|
| 0 | 0 | 0 |
| 1 | 2 | 8 |
| 2 | 5 | 20 |
| 4 | 11 | 44 |
| 6 | 17 | 68 |
| 36 | 107 | 428 |

The `n = 0` row is `Nat` subtraction at work: `3 * 0 - 1 = 0`.

Note that this function is just a name for the formula. The theorems that build matrices put
`4 * (3 * n - 1)` straight into their types, so `hadamardOrder` appears only where the number is
being talked *about* — in [hadamard_428_exists](#/node/hadamard_428_exists) and in
`kh05_hadamard_order : hadamardOrder 36 = 428`.
