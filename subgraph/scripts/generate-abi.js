const fs = require('fs');

const abi = JSON.parse(fs.readFileSync('../contracts/abi/Account.json'));

const isError = (v) => v.type === 'error';

const isNestedArr = (v) => v.inputs && v.inputs.some((i) => i.type && i.type.endsWith('[][]'));

const accountAbi = abi.filter((v) => !(isError(v) || isNestedArr(v)));
// const accountAbi = abi.filter((v) => !(isError(v)));

const folder = './generated';
if (!fs.existsSync(folder)) fs.mkdirSync(folder);

fs.writeFileSync(`${folder}/Account-fixed.json`, JSON.stringify(accountAbi, null, 2));
