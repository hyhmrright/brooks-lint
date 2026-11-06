# HC-09: visible contract

The registry tracks handles by key, permits replacement while older handles are live, and permits start only when its map lacks the key. A prior handle can complete after replacement. The caller has not supplied whether this map is an authoritative exclusion reservation or a diagnostic index whose omissions are permitted; no external admission contract or capacity guarantee is provided. Do not infer either absent protection or full safety from the local map alone.
