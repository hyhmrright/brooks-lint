---
max_turns: 8
timeout_seconds: 180
allowed_tools: [Skill, Read, Glob, Grep]
model: sonnet
runs: 3
---
Quick TypeScript question about this bit of our router config:

```ts
type Route = { path: string; auth: boolean };

const routes = {
  home: { path: "/", auth: false },
  settings: { path: "/settings", auth: true },
} satisfies Record<string, Route>;

const legacyRoutes: Record<string, Route> = {
  home: { path: "/", auth: false },
  settings: { path: "/settings" } as Route,
};
```

If I delete `auth: true` from `routes.settings` I get a compile error, but `legacyRoutes.settings` compiles fine without `auth`. What's the actual difference between `satisfies` and `as` here?
