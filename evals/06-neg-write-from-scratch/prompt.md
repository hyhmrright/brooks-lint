---
max_turns: 8
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
用 Python 写一个线程安全、带 TTL 的 LRU cache：支持 get / put，容量满时淘汰最久未使用的条目，过期条目在访问时惰性清除。直接把代码贴给我就行。
