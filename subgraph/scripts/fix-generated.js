import * as fs from "fs";

const path = "generated/Safe/Safe.ts";
if (!fs.existsSync(path))
  throw new Error(`"${path}" does not exist - please codegen first`);

let contents = fs.readFileSync(path).toString();

contents = contents.replaceAll(
  "[ethereum.Value.fromTupleArray(_approvers)]",
  "[ethereum.Value.fromTupleArray(changetype<ethereum.Tuple[]>(_approvers))]",
);

fs.writeFileSync(path, contents);
