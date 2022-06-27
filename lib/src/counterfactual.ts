import { BytesLike, ethers } from 'ethers';
import { Factory } from './contracts';
import { SafeConstructorDeployArgs } from './deploy';
import { address } from './addr';
import { hexlify, randomBytes } from 'ethers/lib/utils';

export const getRandomSalt = () => ethers.utils.randomBytes(32);

// CREATE address calculation
export const calculateSafeAddress = async (
  args: SafeConstructorDeployArgs,
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
    addr: address(
      await factory.callStatic.create(...args, {
        gasLimit: 100_000,
      }),
    ),
    salt: hexlify(randomBytes(32)),
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
