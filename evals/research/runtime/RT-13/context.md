# RT-13: supplied context

Only a locally timed leaf is supplied. The leaf limits its own lifetime to 60 logical clock units. The caller's setup duration, total budget, start instant, outer cancellation boundary and required usefulness of late results are **not supplied**. The clock and staged helper define local mechanics only; they do not establish an end-to-end contract. Identify the additional evidence needed before judging total deadline coverage. Do not infer a hidden caller from tests.
