import { TypedDataField } from "@ethersproject/abstract-signer";
import { Safe } from "../typechain";

export type SignedTx = Parameters<Safe["execute"]>[0];
export type Tx = SignedTx["tx"];

export const EIP712_TX_TYPE: Record<string, TypedDataField[]> = {
  Tx: [
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "data", type: "bytes" },
    { name: "nonce", type: "uint256" },
  ],
};
