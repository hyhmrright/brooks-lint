import { writeFileSync } from "node:fs";
import {
  ROOT,
  validate,
  reproduce,
  freeze,
  checkFreeze,
  exportCase,
} from "./suite.mjs";
const [command, id] = process.argv.slice(2);
if (command === "freeze") {
  await reproduce();
  writeFileSync(
    ROOT + "offline-evidence.json",
    JSON.stringify(await reproduce(), null, 2) + "\n",
  );
  freeze();
  console.log("Frozen public development benchmark");
} else if (command === "validate") {
  validate();
  checkFreeze();
  await reproduce();
  console.log("PASS: 18 cases, 6 families; offline only");
} else if (command === "reproduce")
  console.log(JSON.stringify(await reproduce(), null, 2));
else if (command === "export")
  console.log(JSON.stringify(exportCase(id), null, 2));
else throw Error("Usage: cli.mjs validate|freeze|reproduce|export BV-NN");
