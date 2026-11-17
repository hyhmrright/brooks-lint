# Nightly file export
CI uses `node ci/run-tests.mjs`. Use its exit code to block release when any
required export test rejects. Status output is useful for humans but CI decides
from the process status.
