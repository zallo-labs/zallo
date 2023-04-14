import { BytesLike, defaultAbiCoder, solidityPack } from 'ethers/lib/utils';
import { asHex } from '../bytes';

export const newAbiType = <T, Struct>(
  type: string,
  asStruct: (t: T) => Struct,
  fromStruct: (s: Struct) => T,
) => {
  const encodeStruct = (value: Struct) => asHex(defaultAbiCoder.encode([type], [value]));
  const decodeStruct = (data: BytesLike, loose?: boolean): Struct =>
    defaultAbiCoder.decode([type], data, loose)[0];
  const packedStruct = (value: Struct) => asHex(solidityPack([type], [value]));

  return {
    type,
    encodeStruct,
    encode: (value: T) => encodeStruct(asStruct(value)),
    decodeStruct,
    decode: (data: BytesLike, loose?: boolean) => fromStruct(decodeStruct(data, loose)),
    asStruct,
    fromStruct,
    packedStruct,
    packed: (value: T) => packedStruct(asStruct(value)),
  };
};
