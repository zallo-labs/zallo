import { gql } from '@apollo/client';
import {
  ContractMethodDocument,
  ContractMethodQuery,
  ContractMethodQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Contract } from 'ethers';
import { FunctionFragment, Interface } from 'ethers/lib/utils';
import { Account__factory, Call, getDataSighash } from 'lib';
import { useMemo } from 'react';
import { ERC20_INTERFACE } from '@token/token';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export const ACCOUNT_INTERFACE = Account__factory.createInterface();

export const UPSERT_USER_FUNCTION =
  ACCOUNT_INTERFACE.functions['upsertUser((address,(address[])[]))'];
export const UPSERT_USER_SIGHSAH = ACCOUNT_INTERFACE.getSighash(UPSERT_USER_FUNCTION);

export const REMOVE_USER_FUNCTION = ACCOUNT_INTERFACE.functions['removeUser(address)'];
export const REMOVE_USER_SIGHASH = ACCOUNT_INTERFACE.getSighash(REMOVE_USER_FUNCTION);

gql`
  query ContractMethod($contract: Address!, $sighash: Bytes!) {
    contractMethod(contract: $contract, sighash: $sighash) {
      id
      fragment
    }
  }
`;

const getFunctions = (interf: Interface): Record<string, FunctionFragment> =>
  Object.fromEntries(
    Object.values(interf.functions).map((f) => [ACCOUNT_INTERFACE.getSighash(f), f]),
  );

const FRAGMENTS = {
  ...getFunctions(ACCOUNT_INTERFACE),
  ...getFunctions(ERC20_INTERFACE),
};

const deserializeFragment = (fragment?: string): FunctionFragment | undefined => {
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
  sighash: string;
}

export const useContractMethod = (call?: Call) => {
  const sighash = getDataSighash(call?.data);
  const preferredFragment = sighash ? FRAGMENTS[sighash] : undefined;

  const { data, ...rest } = useSuspenseQuery<ContractMethodQuery, ContractMethodQueryVariables>(
    ContractMethodDocument,
    {
      client: useApiClient(),
      variables: { contract: call?.to, sighash },
      skip: !call || !sighash || !!preferredFragment,
    },
  );

  const method = useMemo((): ContractMethod | undefined => {
    const fragment = preferredFragment ?? deserializeFragment(data?.contractMethod?.fragment);

    return fragment
      ? {
          fragment,
          contract: Contract.getInterface([fragment]),
          sighash: sighash!,
        }
      : undefined;
  }, [data?.contractMethod?.fragment, preferredFragment, sighash]);

  return [method, rest] as const;
};
