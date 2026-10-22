# Contributing explainers

The site in `site/` **informalizes** the Lean library in `lean/`: for each declaration it shows
the formal statement, a plain-English explanation, an optional interactive illustration, and a
quiz with an answer key. A reader can sign off on a node only after passing its quiz. A node
counts as understood once the reader has also understood every project declaration its
statement mentions.

(This file is about the site only. The Rust search and the Lean library have their own docs:
`README.md`, `lean/README.md`.)

**The Lean is the ground truth.** An explainer is correct only if it matches the statement
exactly as written in `lean/Turyn/*.lean` or `lean/Results.lean`: its hypotheses, the order of
its quantifiers, what is `∃` and what is `∀`, natural-number subtraction (`n - 1` and
`3 * n - 1` stop at 0), 0-indexed `Fin n` positions versus the 1-indexed accessors
`xAt`/`yAt`/`zAt`/`wAt`, and whether something is a `Prop` or a `Bool`. Don't import claims from
the papers or from `lean/README.md` that the Lean doesn't make. If you aren't sure, say so under
`caveats`. See [`#/trust`](https://tangentproofs.github.io/turyn/#/trust) for what was checked and
how (in particular: the concrete TT(6)/TT(36) theorems use `native_decide`).

Humans and AI agents follow the same process.

## What to work on

- `data/needs-explainer.json` on the published site (built into `site/dist/data/`) lists every
  declaration reachable from the headline results that has no explainer yet, closest first,
  with its *meaning dependencies*.
- Prefer nodes whose `meaningDeps` are already explained.
- Each stub page on the site has a ready-to-paste **agent prompt** with the statement, the source
  link and the dependencies.

## Add or patch a node

One file per declaration: `site/nodes/<id>.md`, where `<id>` is the declaration name with a
leading `Turyn.` dropped (`IsHadamardMat.md`, `Result.tt_implies_hadamard.md`,
`energy_identity.md`). Look up ids in `site/data/decls.json`.

```markdown
---
id: IsTurynType                       # = file name, must exist in data/decls.json
title: "Turyn-type: four sequences whose mismatches cancel"   # ≤ 80 chars
summary: "One sentence. Markdown allowed; Lean in `backticks`."
review: draft                         # 'human-reviewed' only after a person checked it against the Lean
authors: [your-handle]                # agents: name the agent and the human who asked, e.g. "claude (for @tangentstorm)"
caveats:                              # optional, but use it whenever English is looser than the Lean
  - "Where the explanation simplifies, or what you're unsure of."
widgets:                              # optional; see the table below
  - type: seq-editor
    title: "TT(6): all five lags cancel"
    config: { preset: tt6, show: [bars, table] }
quiz:                                 # 3–6 questions; ALL must be answered correctly to pass
  - q: "For which shifts `s` does `IsTurynType` require the combined autocorrelation to vanish?"
    type: choice                      # choice | number | text
    choices: ["0 ≤ s < n", "1 ≤ s < n", "1 ≤ s ≤ n", "every s"]
    answer: 1                         # choice: 0-based index · number: a number · text: list of accepted strings
    explain: "Why, pointing at the Lean. Shown after the reader answers."
---

## Plain English

The explanation. Markdown, tables and inline HTML are fine. Link to other nodes as
[IsHadamardMat](#/node/IsHadamardMat).
```

The schema is `site/schema/node.schema.json`. `site/tools/build_site.mjs` also checks that the
`id` matches the file name and is a real declaration, that quiz answers are well-formed, that the
body has a `## Plain English` heading, and warns when a meaning dependency has no explainer.

### Writing good quiz questions

A quiz exists to show that the reader understands the **formal statement**. Good questions test
the hypotheses (`4 ≤ n`, `Canonical1` rather than `Canonical`, `n % 2 = 0`), edge cases the
definitions decide (`n = 0` and `n = 1` under natural subtraction, a lag `s ≥ n`), small
computations (an autocorrelation, `hadamardOrder 6`), and common misreadings ("`hadamard_428_exists`
states that a Hadamard matrix of order 428 exists" — it does not). Every `explain` should point at
the Lean that makes the answer right.

## Widgets

Every demonstration widget is an **illustration**: JavaScript recomputing one case. Each prints a
line saying so. `outline` and `walkthrough` just lay out the proof's own steps with links.

| type | what it shows | config keys |
|---|---|---|
| `seq-editor` | an editable ±1 quadruple (X, Y, Z of length n, W of length n−1), per-lag bars of N_X, N_Y, 2N_Z, 2N_W and their sum, and the `IsTurynType` verdict | `preset`, `n` (1–40), `show`: any of `bars`, `table`, `energy` |
| `autocorr` | one sequence slid over itself: the products and `aperiodicAutocorr a s` | `seq` (+/− string), `s` |
| `energy` | the sums, `x² + y² + 2z² + 2w²` against `6n − 2`, and `(Σa)² = len + 2·totalAutocorr a` per sequence | `preset` |
| `moves` | the ten `Elementary` moves, `IsTurynType` preserved, `Canonical1` status, an endpoint-normalizing search | `preset` |
| `xy-law` | `u_k = x_k·y_k` and the check `u_{n+1−k} = −u_k` for 2 ≤ k ≤ n−1 | `preset` |
| `base-seq` | `step1`: A = Z++W, B = Z++(−W), C = X, D = Y and their vanishing sums | `preset` |
| `tseq` | `step2`: the T-sequence layout, the support condition and the periodic sums | `preset` |
| `gs-array` | the Goethals–Seidel 4×4 block array of `gsMatrixEntry` and the resulting ±1 matrix | `preset`, `n` |
| `hadamard` | a Hadamard matrix as pixels, the orthogonality of two chosen rows, and the `H·Hᵀ = n·I` check | `source`: `tt1`, `tt2`, `tt4`, `tt6`, `kh05`, `sylvester`; `k` (Sylvester) |
| `pipeline` | step-through of `turynToHadamardMatrix` = `typedGsMatrixOfTSequence ∘ step2` | `preset` |
| `outline` | a vertical proof outline with links | `steps: [{text, link?, note?, hard?}]` |
| `walkthrough` | a step-through proof outline with Lean and links | `steps: [{text, lean?, note?, link?, uses?, hard?}]` |

Presets: `n1`, `n2`, `n4` (small TT(1), TT(2), TT(4) found by brute force), `tt6` (TT(6) of
`Examples.lean`), `kh05` (Kharaghani–Tayfeh-Rezaie TT(36)), `broken6` (TT(6) with one entry
flipped), `random`.

The logic lives in `site/assets/turyn.js`, one function per Lean definition (named in its
comment), tested in `site/tools/test_widgets.mjs` against the Lean statements: e.g. TT(1/2/3/4/6)
counts 8/32/0/128/1536, every move preserves `IsTurynType`, the energy identity on every small
TT, `step2`'s support and periodic vanishing, and `H·Hᵀ = n·I` for the order-68 and order-428
matrices. New widget types go in `widgets-interactive.js` / `widgets.js` **and** the `enum` in the
schema.

## Check locally

```sh
cd site
npm ci
npm test        # widget-logic tests, then the node schema and cross-checks
npm run serve   # builds site/dist and serves it on http://localhost:8765
```

Widgets must work at 390 px wide with no horizontal overflow. CI runs the checks on every PR
that touches `site/`, and deploys to GitHub Pages on pushes to `main` that touch `site/`.

## Regenerating the declaration graph

Only needed when `lean/` changes.

```sh
cd lean
lake exe cache get
lake build && lake build Results
lake env lean ../site/tools/ExtractDecls.lean   # writes site/data/decls.raw.json
lake env lean ../site/tools/Axioms.lean         # the #print axioms list on the Trust page
cd ..
python3 site/tools/build_decls.py               # writes site/data/decls.json
```

`ExtractDecls.lean` records the project constants used by each declaration's **type** and
**value**; `build_decls.py` turns those into `meaningDeps` (theorems: the statement; definitions:
statement plus body) and `proofDeps`, plus reverse edges and the distance from the headline
results. `Challenge.lean` (comparator's challenge template, with `sorry`) is not in the graph.

## Discussion

Each node page has a comment thread (giscus, backed by GitHub Discussions in this repo, one
discussion per node titled `node: <id>`, in the **Announcements** category). Use it for questions
and disagreements; use PRs for changes to the text or the quiz key.
