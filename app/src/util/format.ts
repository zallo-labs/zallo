import { Address } from "lib";

export const elipseTruncate = (val: string, beginLen: number, endLen: number) =>
  val.length >= beginLen + endLen
    ? `${val.slice(0, beginLen)}...${val.slice(val.length - endLen)}`
    : val;

export const truncatedAddr = (addr: Address) => elipseTruncate(addr, 6, 4);
