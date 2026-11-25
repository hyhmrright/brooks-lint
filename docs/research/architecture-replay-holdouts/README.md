# Architecture patch acceptance and two external holdouts

A repeatable [Blinker replay command](../../../evals/research/architecture-replay/README.md)
qualifies the frozen mutation on a clean baseline before accepting a candidate's
added-test failures. It records applied patch hashes, inherited and added
test node IDs, full-suite and static results, and any archived caller claims.
It treats claims about the migration and compatibility as source-review work.

We froze the audit instructions and ran six real Codex CLI 0.169.1 arms.
Each case compared the same generic checklist, audit `ee5be61` and audit
`e2271df` against one source snapshot. The arms shared dependency pins,
`gpt-6.1-terra` at low effort and a 240-second wall budget per arm. They
received the same task and worked in distinct repositories that contained
only the snapshot. The evaluator held the upstream changes, probes and
mutation files outside the supplied repositories. All six delivered diffs
and reports before the deadline and were replayed unchanged on fresh copies.

| Case and guidance | First production cut | Pristine public probe | Added test detected the mutation |
|---|---|---|---|
| Python-Markdown, checklist | Make the entire root local and remove parser exposure | Fails | No |
| Python-Markdown, previous audit | Make the entire root local and remove parser exposure | Fails | No |
| Python-Markdown, current audit | Hold the root locally for parsing and keep the exposed binding | Passes | Yes, at a post-conversion assertion |
| markdown-it-py, checklist | Join renderer attribute fragments | Passes | No |
| markdown-it-py, previous audit | Join image-alt text fragments | Passes | No in a secondary dispatch-only replay |
| markdown-it-py, current audit | Join renderer attribute fragments | Passes | No |

## Blinker command controls

The command reproduced the mechanical outcomes of all 13 archived patches.
Three detected the admitted mutation and passed the project checks. From a fresh environment built with the archived lock, the original positive
control still produced 36 passing project tests and four added public-entry
assertion failures in the planted copy. The exact archived checklist patch
passed clean checks but detected no mutation, so the gate returned 1. The
archived block 4 audit passed the mechanical gate; its documented
cross-signal compatibility change still requires separate review.

The new comparison also surfaced a supplemental Pyright diagnostic in the
archived positive control's async wrapper. The evidence includes a separate
test-only refinement using native async receivers. It preserves the original
production change, passes all 36 project tests, and detects the mutation in
the same four cases. Pyright reports the six inherited diagnostics and no
introduced diagnostic on that separate patch. The historical archive remains
the record of the original patch.

## Python-Markdown document-state ownership

The historical source sequence is parent
[`4533285`](https://github.com/Python-Markdown/markdown/commit/4533285c3da10015f1d99c51f29352096d7e533f)
and [`df8b658`](https://github.com/Python-Markdown/markdown/commit/df8b658c5fef18241bb443888e0af3ecdb8cec8f).
Upstream kept the parsed root and source lines reachable during conversion and
released them during reset. The independent extension's postprocessor reads
both while handling the converted result. The probe exercises direct
`Markdown.convert` and the same instance's `convertFile` after reset. The
frozen evaluator mutation instead clears both immediately before the
postprocessors. The clean base and actual upstream change pass the probe.
The variant fails the intended assertion and the inherited 1,227-test
collection retains its baseline outcome, including 72 skips.

All three candidates identified the path from public conversion to
`BlockParser.parseDocument`. The older audit also followed the configurable
parser and exercised an overridden `parseChunk`, but its patch removed
`parser.root`. The checklist identified third-party compatibility as
an unknown and picked the same removal. Their full regressions passed.
The independent extension raised `AttributeError` in both original diffs.

The current audit creates a local root for the immediate `parseChunk` call,
keeps `parser.root`, and returns the current binding in case a subclass
replaces it. Its authored regression runs `Markdown.convert` with a custom
parser and checks that the exposed root persists. It caught the frozen
mutation at that assertion. The second authored test checks that a rebound
root is returned. The mutation-sensitive authored test confirms persistence
through a custom parser, and the registered postprocessor path was checked
by the independent probe alone. The production step removes one read from retained state;
it deliberately leaves the substantial release work for a later patch.
Its report adds the concrete `FootnoteExtension` parser consumer but omits
some sibling convenience and CLI routes listed by the checklist. The
independent extension probe established the decisive caller contract.

The original test collections were 1,228, 1,229 and 1,229 respectively, each
with 72 skips under the default tox test profile. All passed the complete
default `unittest` suite, compilation and project Flake8. The same suites
passed in tox's separate Pygments 2.7.1 profile with 12 skips each. Focused
mutation test selection used the changed API test module to collect stable
node IDs.

A post-hoc probe found a narrower compatibility gap in the current audit
patch. A registered extension can inject a `BlockParser` whose `root`
setter chooses a different element. Before the refactor, `parseChunk`
receives the element exposed by the setter. The original candidate passes
the pre-setter local element to `parseChunk` and later returns the exposed
one. The baseline renders the paragraph and the candidate returns an empty
string. This diagnostic was designed after scoring and prevents treating the
pristine original diff as fully behavior-preserving.

A separate evaluator reference moves serialization and top-level-tag
stripping into a private function to make the last local consumer of the
document root explicit. It leaves the exposed parser binding and extension
ordering intact. Both independent probes passed, along with the complete
1,229-test collection and Flake8. Its own regression runs a registered
postprocessor and fails at the expected assertion under premature release.
Its second regression covers the descriptor-based parser binding. Neither
reference test changes the blind comparison.

## markdown-it-py renderer fragment assembly

The historical source sequence is parent
[`17b7227`](https://github.com/executablebooks/markdown-it-py/commit/17b7227e8b287f1a158914bd02f4b6a3a620c813)
and [`9aa1aae`](https://github.com/executablebooks/markdown-it-py/commit/9aa1aae4765cddd5890a53acf0b5b523a12a72eb)
from [upstream #458](https://github.com/executablebooks/markdown-it-py/pull/458).
The production-only upstream patch is the frozen mutation. A type-correct
registered render rule returns `Markup`, a string subclass. The baseline
preserves its type through both `renderInline` and `render`; its concatenation
also changes the visible block string. The upstream assembly returns a plain
string, and the independent probe stops at the inline subtype assertion.
The full inherited test count is 1,185 on pristine and mutated baseline.

All three reports traced both public rendering calls and rule injection.
The previous audit also traced and tested recursive override dispatch for
image alt text, then changed that loop. Its diff conflicts with the
full frozen mutation in that same method. A separately labeled secondary
replay applies only the unchanged block and inline dispatch hunks from the
upstream patch. It makes the independent probe fail on both the baseline
and the older candidate, leaves all inherited tests green, and leaves all
three of the older candidate's authored tests green. The other two arms
changed the neighboring attribute loop and deferred both callback-driven
assembly loops. Their authored tests pass under the full frozen mutation.
The experiment establishes no current-audit advantage for the target
custom-result contract and measures no interpreter speedup.

A secondary compatibility probe injects a renderer whose recursive
image-alt override returns a `Markup` fragment. The older audit's original
diff changes the final attribute's escaping, even though it passes the
frozen block and inline probe and its own recursive override test. The
baseline and the other two original patches preserve the output. This
check used ordinary ampersands and was added after the frozen comparison.

Original candidate suites passed with 1,187, 1,188 and 1,187 tests. All passed
compilation, Ruff 0.17.4 lint and format, and configured file checks.
Mypy 2.4.1 initially reported the same missing stubs on base and candidates.
After installing the same frozen requests and Atheris stubs for every tree,
the same Mypy check passed on all four. Candidate patches were unchanged.

## Interpretation

The current audit was the only arm to preserve the behavior in the frozen
Python-Markdown probe while rejecting the planted regression with an authored
test. The descriptor diagnostic found an additional compatibility failure.
None of the arms detected the markdown-it contract change. Both cases involve Markdown libraries, and the replays
do not establish cross-domain reliability. The two guide versions remained
frozen throughout this study.
