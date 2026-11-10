import { writeFileSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  ROOT,
  freezeData,
  validate,
  exportInputs,
  reproduce,
  sha256,
} from "./suite.mjs";
const [command = "validate", argument, ...extra] = process.argv.slice(2);
if (extra.length || (argument && command !== "export"))
  throw new Error("usage: cli.mjs validate|reproduce|freeze|export <case-id>");
if (command === "freeze") {
  writeFileSync(
    path.join(ROOT, "freeze.json"),
    JSON.stringify(freezeData(), null, 2) + "\n",
  );
  console.log(
    "Wrote explicit development freeze; archive superseded revisions before future changes.",
  );
} else if (command === "reproduce") {
  validate();
  console.log(JSON.stringify(await reproduce(), null, 2));
} else if (command === "export") {
  console.log(JSON.stringify(exportInputs(argument), null, 2));
} else if (command === "validate") {
  const m = validate();
  const actual = JSON.stringify(await reproduce(), null, 2) + "\n";
  if (actual !== readFileSync(path.join(ROOT, "offline-evidence.json"), "utf8"))
    throw new Error("offline observations drift");
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        families: m.families.length,
        cases: m.cases.length,
        freezeSha256: sha256(readFileSync(path.join(ROOT, "freeze.json"))),
        modelCalls: 0,
      },
      null,
      2,
    ),
  );
} else throw new Error("unknown command");
