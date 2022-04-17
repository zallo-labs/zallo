import { Bytes, ethers } from 'ethers';
import { Safe__factory } from './typechain';
import { abiEncodeGroup, Group } from './group';

export const getRandomSalt = () => ethers.utils.randomBytes(32);
// export const getRandomSalt = () =>
//   ethers.utils.toUtf8Bytes('0x0426066fa541c0029327a6e97e195d5104a16affba49a7279c9123be12f6cd4d');

export const getCounterfactualAddress = (deployer: string, group: Group, salt?: Bytes) => {
  if (!salt) salt = getRandomSalt();

  const safeBytecode = ethers.utils.arrayify(Safe__factory.bytecode);
  const encodedGroup = abiEncodeGroup(group);

  const packedInitCode = ethers.utils.solidityPack(
    ['bytes', 'bytes'],
    [safeBytecode, ethers.utils.arrayify(encodedGroup)],
  );
  const initCodeHash = ethers.utils.keccak256(packedInitCode);

  const addr = ethers.utils.getCreate2Address(deployer, salt, initCodeHash);
  return { addr, salt };
};
