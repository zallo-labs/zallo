import { Address, UAddress, asAddress } from 'lib';

export const elipseTruncate = (val: string, beginLen: number, endLen: number = beginLen) =>
  val.length > beginLen + endLen
    ? `${val.slice(0, beginLen)}...${val.slice(val.length - endLen)}`
    : val;

export const truncateAddr = (address: Address | UAddress) => {
  // TODO: show chain?
  return elipseTruncate(asAddress(address), 5, 3);
};

export const clog = (value: unknown) => console.log(JSON.stringify(value, null, 2));
