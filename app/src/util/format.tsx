export const elipseTruncate = (val: string, beginLen: number, endLen: number) =>
  val.length >= beginLen + endLen
    ? `${val.slice(0, beginLen)}...${val.slice(val.length - endLen)}`
    : val;
