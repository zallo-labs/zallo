import { BigNumber, BytesLike, ethers } from 'ethers';
import { Factory, Safe__factory } from './typechain';
import { abiEncodeGroup, Group } from './group';

export const getRandomSalt = () => ethers.utils.randomBytes(32);

// CREATE address calculation
export const calculateSafeAddress = async (
  group: Group,
  factory: Factory,
  _salt?: BytesLike,
) => {
  // zkSync FIXME: zksync CREATE calculates deploy address differently
  // return {
  //   addr: ethers.utils.getContractAddress({
  //     from: factory.address,
  //     nonce: await factory.provider.getTransactionCount(factory.address),
  //   }),
  //   salt: '',
  // };

  return {
    addr: await factory.callStatic.create(group),
    salt: '0x00',
  };
};

// zkSync FIXME: CREATE2 support
// export const calculateSafeAddress = async (
//   group: Group,
//   factory: Factory,
//   salt?: BytesLike,
// ) => {
//   if (!salt) salt = getRandomSalt();

//   // TODO: try replace with keccak256(getDeployTransaction(...).bytecode)??
//   const safeBytecode = ethers.utils.arrayify(Safe__factory.bytecode);
//   const encodedGroup = abiEncodeGroup(group);

//   const packedInitCode = ethers.utils.solidityPack(
//     ['bytes', 'bytes'],
//     [safeBytecode, ethers.utils.arrayify(encodedGroup)],
//   );
//   const initCodeHash = ethers.utils.keccak256(packedInitCode);

//   const addr = ethers.utils.getCreate2Address(
//     factory.address,
//     salt,
//     initCodeHash,
//   );
//   return { addr, salt };
// };
