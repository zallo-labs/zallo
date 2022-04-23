import { BytesLike, ethers } from 'ethers';
import { Factory, Safe__factory } from './typechain';
import { abiEncodeGroup, Group } from './group';

export const getRandomSalt = () => ethers.utils.randomBytes(32);

export const getCounterfactualAddress = (
  factory: Factory,
  group: Group,
  salt?: BytesLike,
) => {
  if (!salt) salt = getRandomSalt();

  const safeBytecode = ethers.utils.arrayify(Safe__factory.bytecode);
  const encodedGroup = abiEncodeGroup(group);

  const packedInitCode = ethers.utils.solidityPack(
    ['bytes', 'bytes'],
    [safeBytecode, ethers.utils.arrayify(encodedGroup)],
  );
  const initCodeHash = ethers.utils.keccak256(packedInitCode);

  const addr = ethers.utils.getCreate2Address(
    factory.address,
    salt,
    initCodeHash,
  );
  return { addr, salt };
};
