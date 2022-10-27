import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import assert from 'assert';
import { BigNumber } from 'ethers';
import {
  Address,
  address,
  compareAddress,
  Limit,
  User,
  UserConfig,
  UserId,
} from 'lib';
import { useMemo } from 'react';
import {
  UserDocument,
  UserQuery,
  UserQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Proposable } from '~/gql/proposable';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface CombinedUser extends UserId {
  name: string;
  isActive: boolean;
  configs: Proposable<UserConfig[]>;
}

export const toActiveUser = (user: CombinedUser): User => {
  assert(user.configs.active);

  return {
    addr: user.addr,
    configs: user.configs.active,
  };
};

export const toProposedUser = (user: CombinedUser): User => {
  assert(user.configs.proposed);

  return {
    addr: user.addr,
    configs: user.configs.proposed,
  };
};

gql`
  query User($id: UserIdInput!) {
    user(id: $id) {
      id
      accountId
      deviceId
      name
      activeState {
        ...UserStateFields
      }
      proposedState {
        ...UserStateFields
      }
    }
  }

  fragment UserStateFields on UserState {
    proposalHash
    configs {
      approvers {
        deviceId
      }
      spendingAllowlisted
      limits {
        token
        amount
        period
      }
    }
  }
`;

const convertState = (
  s: UserQuery['user']['activeState'],
): UserConfig[] | undefined =>
  s?.configs?.map((c) => ({
    approvers:
      c.approvers?.map((a) => address(a.deviceId)).sort(compareAddress) ?? [],
    spendingAllowlisted: c.spendingAllowlisted,
    limits: Object.fromEntries(
      c.limits?.map((l) => {
        const token = address(l.token);
        const limit: Limit = {
          token,
          amount: BigNumber.from(l.amount),
          period: l.period,
        };
        return [token, limit];
      }) ?? [],
    ),
  }))?.sort((a, b) => b.approvers.length - a.approvers.length);

export const useUser = <Id extends UserId | Address | undefined>(
  idInput: Id,
) => {
  const device = useDevice();
  const id = useMemo(
    (): UserId | undefined =>
      idInput
        ? typeof idInput === 'object'
          ? idInput
          : {
              account: idInput,
              addr: device.address,
            }
        : undefined,
    [device.address, idInput],
  );

  const { data, ...rest } = useSuspenseQuery<UserQuery, UserQueryVariables>(
    UserDocument,
    {
      client: useApiClient(),
      variables: {
        id: {
          account: id?.account,
          device: id?.addr,
        },
      },
      skip: !id,
    },
  );
  usePollWhenFocussed(rest, 15);

  const u = data.user;
  const user = useMemo((): CombinedUser | undefined => {
    if (!id) return undefined;

    return {
      ...id,
      name: u.name,
      isActive: u.activeState !== null,
      configs: new Proposable({
        active: convertState(u.activeState),
        proposed: convertState(u.proposedState)!,
        proposal: u.proposedState?.proposalHash
          ? {
              account: id.account,
              hash: u.proposedState.proposalHash,
            }
          : undefined,
      }),
    };
  }, [id, u]);

  return [
    user as CombinedUser | (Id extends undefined ? undefined : never),
    rest,
  ] as const;
};
