import { gql } from '@apollo/client';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { address, Limit, User, UserConfig, UserId } from 'lib';
import { useMemo } from 'react';
import {
  UserDocument,
  UserQuery,
  UserQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { Proposable2 } from '~/gql/proposable2';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';

export interface CombinedUser extends UserId {
  name: string;
  isActive: boolean;
  configs: Proposable2<UserConfig[]>;
}

export const toActiveUser = (user: CombinedUser): User => {
  assert(user.configs.active);

  return {
    addr: user.addr,
    configs: user.configs.active,
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
    approvers: c.approvers?.map((a) => address(a.deviceId)) ?? [],
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
  })) ?? [];

export const useUser = (id: UserId) => {
  const { data, ...rest } = useSuspenseQuery<UserQuery, UserQueryVariables>(
    UserDocument,
    {
      client: useApiClient(),
      variables: {
        id: {
          account: id.account,
          device: id.addr,
        },
      },
    },
  );
  usePollWhenFocussed(rest, 30);

  const u = data.user;
  const user = useMemo(
    (): CombinedUser => ({
      ...id,
      name: u.name,
      isActive: u.activeState !== null,
      configs: new Proposable2({
        active: convertState(u.activeState),
        proposed: convertState(u.proposedState)!,
        proposal: u.proposedState?.proposalHash
          ? {
              account: id.account,
              hash: u.proposedState.proposalHash,
            }
          : undefined,
      }),
    }),
    [id, u],
  );

  return [user, rest] as const;
};
