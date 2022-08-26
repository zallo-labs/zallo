import { gql } from '@apollo/client';
import { useContractMethodQuery } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Contract } from 'ethers';
import { BytesLike } from 'ethers';
import {
  FunctionFragment,
  hexDataLength,
  hexDataSlice,
  Interface,
} from 'ethers/lib/utils';
import { Account__factory, Call } from 'lib';
import { useMemo } from 'react';
import { ERC20_INTERFACE } from '@token/token';

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_ACCOUNT_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertWallet(bytes4,address[][])'];
export const UPSERT_WALLET_SIGHSAH = ACCOUNT_INTERFACE.getSighash(
  UPSERT_ACCOUNT_FUNCTION,
);

export const REMOVE_WALLET_FUNCTION =
  ACCOUNT_INTERFACE.functions['removeWallet(bytes4)'];
export const REMOVE_WALLET_SIGHASH = ACCOUNT_INTERFACE.getSighash(
  REMOVE_WALLET_FUNCTION,
);

gql`
  query ContractMethod($contract: Address!, $sighash: Bytes!) {
    contractMethod(contract: $contract, sighash: $sighash) {
      id
      fragment
    }
  }
`;

const getDataSighash = (data?: BytesLike) =>
  data && hexDataLength(data) >= 4 ? hexDataSlice(data, 0, 4) : undefined;

const getFunctions = (interf: Interface): Record<string, FunctionFragment> =>
  Object.fromEntries(
    Object.values(interf.functions).map((f) => [
      ACCOUNT_INTERFACE.getSighash(f),
      f,
    ]),
  );

const FRAGMENTS = {
  ...getFunctions(ACCOUNT_INTERFACE),
  ...getFunctions(ERC20_INTERFACE),
};

const deserializeFragment = (
  fragment?: string,
): FunctionFragment | undefined => {
  try {
    if (fragment) return FunctionFragment.from(JSON.parse(fragment));
  } catch {
    // return undefined
  }

  return undefined;
};

export interface ContractMethod {
  fragment: FunctionFragment;
  contract: Interface;
  name: string;
  sighash: string;
}

export const useContractMethod = (call?: Call): ContractMethod | undefined => {
  const sighash = getDataSighash(call?.data);
  const preferredFragment = sighash ? FRAGMENTS[sighash] : undefined;

  const { data } = useContractMethodQuery({
    client: useApiClient(),
    variables: { contract: call?.to, sighash },
    skip: !call || !sighash || !!preferredFragment,
  });

  return useMemo(() => {
    const fragment =
      preferredFragment ?? deserializeFragment(data?.contractMethod?.fragment);

    return fragment
      ? {
          fragment,
          contract: Contract.getInterface([fragment]),
          name: fragment.name || sighash!,
          sighash: sighash!,
        }
      : undefined;
  }, [data?.contractMethod?.fragment, preferredFragment, sighash]);
};
