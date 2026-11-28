# 001: context mismatch in the OpenAI Cookbook patch CLI

The reviewed original now receives `verified` for context rejection. Processing
and committing one file section at a time receives `counterexample`. The
frozen verifier at `a71343d52c99057f706234aa375f967109d57a5a` declined
both programs under its original 001 contract and under the new contract.

## Reproduce

With a full Git checkout, Node, Python 3.11 and Lean 4.19.0 on PATH, run:

```sh
python3.11 -I -B docs/research/001-cookbook/replay.py
```

The offline run installs the current skill in a temporary directory, restores
the previous checker from Git, derives the mutant from [one diff](eager.patch),
replays both certificates and compares 16 real CLI invocations to the
[committed results](results.json). The Linux Node 22 CI job runs the same command.

| Input | Original CLI | Per-file mutant |
| --- | --- | --- |
| All three updates valid | Writes all three in order | Same |
| First, middle or last context rejected | No target mutations in all three runs | Writes the valid prefix of length 0, 1 or 2 |
| Two files, second context rejected | No target mutations | Writes `first.txt` from `old\n` to `new\n`, then rejects `last.txt` containing `unmatched\n` |
| Same witness with identity replacement in the first file | No target mutations | Opens the first target for writing even though its final bytes are identical |
| Second hunk of last file rejected | No target mutations | First file already changed |
| Add and delete followed by an update-context rejection | No file created, removed or modified | Creates one file and removes another before rejection |

The native oracle checks target write-open, rename and remove events, file
existence and exact bytes independently of the checker. Each rejected invocation
prints its invalid-context diagnostic on stderr and exits 0. The success control
prints `Done!` and changes all three files.

## What the certificate covers

The [contract](contract.json) concerns context that the Cookbook parser actually
rejects, including its whitespace-tolerant matching rules. With the original
CLI's default callbacks, `load_files` only reads, `text_to_patch` parses against
that snapshot, and `patch_to_commit` constructs changes in memory. An invalid
context raises `DiffError` during parsing. Control returns to the CLI handler
before `apply_commit`, the first place that can call a write or removal callback.

The [staged certificate](certificates/original.lean) proves the effect for an
arbitrary disk and finite target list, with a rejected target after any prefix
and before any suffix. Even if an earlier target rejects first, the write trace
is empty and the resulting disk equals the initial disk. The
[per-file certificate](certificates/per-file.lean) evaluates the concrete
two-file witness in the table. Replay type-checks the claims independently and
checks that Lean reports no axiom dependencies for each.

The trusted step is the source-to-model correspondence: a human-reviewed
pure preparation phase followed by an effectful commit. The checker pins the
entire [original source](../001-independent/holdout/samples/cookbook/apply_patch.py)
to the [upstream notebook cell](https://github.com/openai/openai-cookbook/blob/7c3a2a78e19d1c42fd6e2512cb48a36a20970584/examples/gpt4-1_prompting_guide.ipynb)
and admits exactly the reviewed per-file schedule as a second case. Replay also
injects a write into the parsing helper and requires `unverified`. Lean models
the failure's effects; the parser's matching algorithm, arbitrary callbacks,
concurrent filesystem changes and I/O errors during commit are outside this
claim. This resolves a previously unsupported sample for two specific source
revisions. It provides no new independent transfer evidence for a general
mandatory gate.
