# Correction: abandoned stream fragments were counted as answer text

The previous sweep B result **14/15** cannot be attributed to the skill. Raw events
show a response-stream disconnect after an incomplete JSON prefix, followed by a
new message that completed with valid JSON. The collector joined both message IDs.
The corrected completed-message view yields **15/15 sweep B complete responses and
artifact passes**, tied with A, and **45/45 evidence** instead of 44/45.

This was discovered during preparation of the three-skill revision study, after
the original semantic report had been committed. The root reviewer audited **all
318 completed responses**, not just the observed failure. Exactly two answers had
orphan delta contamination:

| Response | Abandoned content | Completed-event effect |
| --- | --- | --- |
| AS-26, B, repeat 2, `0fe9233be960c955b315` | Truncated JSON from a disconnected item | One valid replacement object passes the original unchanged behavior and preservation oracle; evidence item 1 and complete/artifact success restored |
| PB-07, C, repeat 2, `950579f179f8fdae93de` | `**Finding` from a disconnected item | All existing evidence excerpts remain in the completed answer; runtime scores unchanged |

Every response has exactly one completed `final_answer` item in this archived
corpus. The other 316 answers match their completed-event text byte for byte.
All health arithmetic errors are in completed answers, so the health result is
unchanged. Review, audit, debt, test and maintenance results are also unchanged.
No new model calls were made for this audit.

## Diagnosis and correction

**Symptom:** a completed sweep response was represented as a partial JSON draft
followed by a complete object. **Source:** the historical `answerText` helper kept
every delta item in a map and joined it with completed items even after a stream
reconnect abandoned the first item. **Consequence:** a transport/capture artifact
was mistaken for model output, producing one false artifact/completeness failure.
**Remedy:** derive successful answers only from completed agent-message events;
preserve orphan/partial text separately for diagnostics. Legitimately completed
commentary must not be silently discarded merely to make JSON pass. Missing
completed content must not be silently upgraded from partial deltas.

The revision study uses the repaired collector for both original and revised
skill guidance. The sweep instruction change is reasonable output-contract
hardening, but this historical event provides no evidence that the model needed
that fix. The earlier claim of a sweep skill regression is withdrawn.

## Preserved evidence and reproducibility

Original raw archives, `record.answer`, receipts, annotations, primary result
files and frozen rubrics are unchanged. The original report/README have explicit
correction notices; the original tables remain available. This directory holds a
**versioned derived answer view**, not rewritten raw output:

- `audit.json`: all-corpus count, affected IDs, raw/answer hashes, completed text,
  abandoned items, and unchanged original versus corrected artifact checks.
- `annotation-revisions.json`: both original and corrected reviews for two answers.
- `all-skills-corrected-summary.json`: corrected derived-view statistics.
- `runtime-corrected-summary.json`: unchanged runtime statistics with view identity.

The offline reproducer first verifies the original archive reconstruction using
a clean source checkout at commit `37fd5a282df17736541c7c36d109f4ab070bbc8a`.
It then selects completed event text, rechecks exact citations and the original
artifact oracle, and derives separate summaries. It asserts exactly two affected
answers, unchanged other-skill/runtime results, and the corrected sweep totals.

```bash
node docs/research/all-skills-results/2026-11-11-terra-low-campaign/collector-correction/reproduce.mjs RAW_ROOT PINNED_SOURCE_ROOT NEW_OUTPUT_DIRECTORY
```

`RAW_ROOT` is the extraction of both preserved archives. `PINNED_SOURCE_ROOT` is
the clean detached checkout documented in the parent README. Compare all four
outputs with this directory. No network or model calls are made. The correction
was assessed by the current gpt-6-astra root reviewer with rubric and arm exposure;
it is not independent human validation or provider identity attestation. The
initial QA established internal consistency but did not establish that the answer
extraction policy faithfully excluded abandoned message items. This audit closes
that specific gap without claiming perfect extraction for every future protocol.
