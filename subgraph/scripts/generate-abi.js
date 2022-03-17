const fs = require("fs");
const abi = JSON.parse(fs.readFileSync("../contracts/abi/Safe.json"));

const isError = (v) => v.type === "error";

const isNestedArr = (v) =>
  v.inputs && v.inputs.some((i) => i.type && i.type.endsWith("[][]"));

// const safeAbi = abi.filter((v) => !isError(v));
const safeAbi = abi.filter((v) => !(isError(v) || isNestedArr(v)));

const folder = "./generated";
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

fs.writeFileSync(`${folder}/Safe-fixed.json`, JSON.stringify(safeAbi, null, 2));
