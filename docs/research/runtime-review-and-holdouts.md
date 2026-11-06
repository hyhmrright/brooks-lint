# Runtime research: human review and independent holdouts

Status: participation procedure, 2026-11-06. Human review, source verification,
and independent holdouts remain pending. Agent authorship and agent QA do not
fulfill them. See the [pilot plan](runtime-pilot-plan.md) and
[research fixtures](../../evals/research/runtime/README.md).

The [public-source candidate catalog](runtime-candidate-catalog.md) organizes
further development proposals. Prospective blind holdout authors should defer
reading it until their contribution track and exposure boundary are agreed.

A [progress update and invitation](https://github.com/hyhmrright/brooks-lint/discussions/45#discussioncomment-19433722)
was posted on 2026-11-06. Reviewer participation and independent holdout delivery
remain pending; an invitation does not establish either.

## Two contribution tracks

| Track | Who and what | Deliverable |
| --- | --- | --- |
| Review and source verification | A person other than the prompt/rubric author reviews diagnostic relevance, severity and source applicability. Disclose prior involvement and access. | A signed review record for each case or rule, with disagreements and verified references. |
| Independent holdouts | A contributor creates new cases before seeing development fixtures, rubrics or prototype guidance where practical. Disclose anything already seen. | A separately frozen case set with private expected outcomes and provenance, reserved for later evaluation. |

One contributor may help both tracks, but someone who has reviewed the development
materials cannot claim to be a blind holdout author. They can still contribute
valuable external examples, labeled with that exposure. No participant has been
assigned work or agreed to review by being mentioned in a discussion.

## Human review workflow

Ask for one small review first: one defective case and its protected variant, or
one incomplete-context control. Share the exact commit and intended inspection
boundary. Have the reviewer first write their own diagnosis from visible inputs,
then compare it with the rubric. Keep both responses; this reduces anchoring but
does not make a reviewer unfamiliar with the project fully blind.

Review these questions:

1. Does the supplied contract justify the asserted requirement? Is its provenance
   clear, and are any assumptions being treated as observed production facts?
2. Does the source and execution trace establish the claimed consequence? Could a
   caller, transport, or alternate interpretation invalidate the diagnosis?
3. Are protection and missing context distinguished? Are the forbidden claims fair?
4. Is severity supported by the demonstrated reach and impact? Is a single cause
   counted more than once, including overlap with core risks?
5. Does each proposed source actually support the rule, its applicability, and
   exceptions? Does the code evidence support the case independently of a citation?

Use this review record in a PR targeting `research/domain-packs`:

```text
Reviewer / date / role:
Commit and case or rule:
Prior involvement and materials already seen:
Own assessment before viewing rubric:
Rubric comparison: agree / revise / unresolved
Evidence and causal-trace critique:
Severity and overlap critique:
Requested revision or unresolved question:
Source verification status: pending / verified / rejected / unavailable
Reference: title, author, edition/year, chapter/section, page or stable URL
Claim supported and relevant exception:
Access/retrieval date where relevant:
Reviewer sign-off and remaining limitations:
```

Verify editions and precise sections against a copy the reviewer can inspect or
an authoritative publisher/author source. Record unavailable references as pending
or unavailable, never invent page numbers or promote a familiar slogan to a
verified citation. Keep quotations short; references and original summaries are
sufficient. Candidate sources do not enter the canonical book inventory through
this process alone.

Preserve disagreements in the record. The maintainer and reviewer should resolve
them through evidence or leave the claim unresolved. A revised rubric or guidance
gets a new revision and digest; do not overwrite the basis of a completed run.
Record reviewer identity and scope rather than calling one informal comment full
human validation of all cases. Before any authorized live study, explicitly decide
whether its reviewed subset and remaining limitations are acceptable.

## Holdout workflow

The current cases and prototype are development material. A genuinely independent
set needs a separate author and custody boundary; a new case from the same agent
does not become independent through a new identifier.

1. Give the author a neutral scope brief: dependency bounds, attempt ownership,
   finite resource contention, legitimate protected variants, and missing-context
   controls. Ask for synthetic or licensed examples with secrets removed. Do not
   send current fixtures, rubrics, model outputs, or prototype wording. A practical
   initial set is one new defect, one protected tradeoff, and one unresolved case;
   this is a feasibility sample, not statistical coverage.
2. Ask for runnable deterministic fixtures, a natural task, explicit visible-input
   boundaries, provenance, and a separate expected assessment with causal evidence,
   acceptable severity, and forbidden claims. Request a different structure or
   context rather than renaming an existing fixture. Keep answers out of model
   inputs. Disclose code assistance, prior project involvement, and exposure.
3. Have a custodian receive the delivery through an agreed private channel, hash
   every file with SHA-256, and record author, date, license, exposure, and revision.
   Keep expected outcomes and case contents unavailable to prototype authors while
   tuning continues. Only sanitized digests and custody status need be public.
   Do not put secrets or private operational data in a PR.
4. Freeze the prototype and run plan before revealing the reserved inputs. Freeze
   the holdout manifest and rubrics before any model run. The future evaluation
   must use the same arms, limits, and evidence rules as the development study;
   reviewer and rubric access must remain separate from model inputs.
5. Preserve every run and failure. Judge the reserved set before tuning on its
   results. Once its contents or outcomes influence guidance, mark that set exposed
   development data and obtain another independent set for a later confirmation.

The initial research runner supports the authored development catalog only.
Holdout ingestion, private custody and a holdout run plan require a separately
reviewed extension; do not bypass a catalog validator or copy answers into inputs
to make a reserved set run. Contribution records can be prepared now without
running models or claiming the holdout gate is complete.

Suggested custody record:

```text
Set ID / revision / author / custodian:
Authorship, assistance, prior involvement and exposure disclosure:
License and sanitization check:
Delivery date and private storage location (omit sensitive details publicly):
File paths and SHA-256 digests, including separate rubric files:
Who accessed contents / when / why:
Prototype revision and digest frozen before release:
Status: reserved / exposed / evaluated / retired
Reason for status changes and next independent set needed:
```

## Invitation template

This historical draft remains a reusable template. The actual invitation is
linked above; adding or editing this template sends no message.

> We have an offline runtime research branch and would welcome your help. Would
> you prefer to review one diagnosis/protected pair and its source grounding, or
> author a small independent set of examples? For the latter, please wait to read
> the existing fixtures and guidance so we can preserve a useful holdout. We can
> agree on a neutral scope brief and an exchange method before you start. A focused
> review or counterexample is useful; there is no expectation to own the whole
> project. Contributions can target `research/domain-packs`, with direction and
> questions in Discussion #45.

Use [Discussion #45](https://github.com/hyhmrright/brooks-lint/discussions/45)
to coordinate scope and volunteers. Avoid linking a prospective blind holdout
author directly to development answers before choosing a track. Actual messages,
reviewer participation and live evaluation each remain separate actions.
