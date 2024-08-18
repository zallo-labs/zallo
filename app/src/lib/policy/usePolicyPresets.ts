import {
  AccountIcon,
  IconProps,
  SwapIcon,
  imageFromSource,
  materialCommunityIcon,
  materialIcon,
} from '@theme/icons';
import { PolicyDraft, PolicyDraftAction } from './policyAsDraft';
import {
  ACCOUNT_ABI,
  Address,
  PLACEHOLDER_ACCOUNT_ADDRESS,
  PolicyKey,
  UPGRADE_APPROVER,
  asAddress,
  asFp,
  asSelector,
} from 'lib';
import { FC, useMemo } from 'react';
import { getAbiItem, toFunctionSelector } from 'viem';
import { SYNCSWAP, ERC721_ABI, USDC, USDT, DAI, Token } from 'lib/dapps';
import { Chain } from 'chains';
import Decimal from 'decimal.js';
import { Duration, DurationLikeObject } from 'luxon';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { usePolicyPresets_account$key } from '~/api/__generated__/usePolicyPresets_account.graphql';
import { usePolicyPresets_user$key } from '~/api/__generated__/usePolicyPresets_user.graphql';

type ActionDefinition = Omit<PolicyDraftAction, 'allow'> & { icon?: FC<IconProps> };

export const ACTION_PRESETS = {
  all: {
    icon: materialIcon('circle'),
    label: 'Anything else',
    description: undefined,
    functions: [{ contract: undefined, selector: undefined, abi: undefined }],
  },
  sendNfts: {
    icon: imageFromSource(require('assets/ENS.svg')),
    label: 'Send NFTs',
    description: undefined,
    functions: [
      getAbiItem({ abi: ERC721_ABI, name: 'safeTransferFrom', args: ['0x', '0x', 0n] }),
      getAbiItem({ abi: ERC721_ABI, name: 'safeTransferFrom', args: ['0x', '0x', 0n, '0x'] }),
      getAbiItem({ abi: ERC721_ABI, name: 'transferFrom' }),
      getAbiItem({ abi: ERC721_ABI, name: 'approve' }),
      getAbiItem({ abi: ERC721_ABI, name: 'setApprovalForAll' }),
    ].map((f) => ({
      contract: undefined,
      selector: asSelector(toFunctionSelector(f)),
      abi: undefined,
    })),
  },
  manageAccount: {
    icon: AccountIcon,
    label: 'Manage account',
    description: undefined,
    functions: (account: Address) => [{ contract: account, selector: undefined, abi: undefined }],
  },
  cancelDelayedTransactions: {
    icon: materialCommunityIcon('calendar-remove'),
    label: 'Cancel scheduled transaction',
    description: undefined,
    functions: (account: Address) => [
      {
        contract: account,
        selector: asSelector(
          toFunctionSelector(getAbiItem({ abi: ACCOUNT_ABI, name: 'cancelScheduledTransaction' })),
        ),
        abi: undefined,
      },
    ],
  },
  syncswapSwap: {
    icon: SwapIcon,
    label: 'Swap (SyncSwap)',
    description: undefined,
    functions: (chain: Chain) =>
      [
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swap' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swapWithPermit' }),
      ].map((f) => ({
        contract: SYNCSWAP.router.address[chain],
        selector: asSelector(toFunctionSelector(f)),
        abi: undefined,
      })),
  },
  syncswapLiquidity: {
    icon: materialCommunityIcon('water'),
    label: 'Manage liquidity (SyncSwap)',
    description: undefined,
    functions: (chain: Chain) =>
      [
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'addLiquidity' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'addLiquidity2' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'addLiquidityWithPermit' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'addLiquidityWithPermit2' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'burnLiquidity' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'burnLiquiditySingle' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'burnLiquiditySingleWithPermit' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'burnLiquidityWithPermit' }),
      ].map((f) => ({
        contract: SYNCSWAP.router.address[chain],
        selector: asSelector(toFunctionSelector(f)),
        abi: undefined,
      })),
  },
} satisfies Record<
  string,
  | ActionDefinition
  | (Omit<ActionDefinition, 'functions'> & {
      functions: (...params: any[]) => ActionDefinition['functions'];
    })
>;

const Account = graphql`
  fragment usePolicyPresets_account on Account {
    id
    address
    approvers {
      id
      address
    }
  }
`;

const User = graphql`
  fragment usePolicyPresets_user on User {
    id
    approvers {
      id
      address
    }
  }
`;

function limit(chain: Chain, token: Token, amount: Decimal, duration: DurationLikeObject) {
  if (!token.address[chain]) return {};

  return {
    [token.address[chain]!]: {
      amount: asFp(amount, token),
      duration: Duration.fromObject(duration).as('seconds'),
    },
  };
}

export const PolicyPresetKey = {
  high: 0 as PolicyKey,
  low: 1 as PolicyKey,
  medium: 2 as PolicyKey,
  recovery: 3 as PolicyKey,
  upgrade: 4 as PolicyKey,
} as const;

export const getPolicyPresetDetails = (n: number) =>
  ({
    low: {
      name: 'Low risk',
      threshold: 1,
    },
    medium: {
      name: 'Medium risk',
      threshold: Math.max(Math.round(n * 0.4), 1),
    },
    recovery: {
      name: 'Recovery',
      threshold: Math.max(Math.round(n * 0.63), 1),
    },
    high: {
      name: 'High risk',
      threshold: Math.max(Math.round(n * 0.85), 1),
    },
    upgrade: {
      name: 'Upgrade',
      threshold: 1,
    },
  }) as const;

export interface UsePolicyPresetsParams {
  account: usePolicyPresets_account$key | null | undefined;
  user: usePolicyPresets_user$key;
  chain: Chain;
}

export function usePolicyPresets({ chain, ...params }: UsePolicyPresetsParams) {
  const account = useFragment(Account, params.account);
  const user = useFragment(User, params.user);

  return useMemo(() => {
    const accountAddress = asAddress(account?.address) ?? PLACEHOLDER_ACCOUNT_ADDRESS;
    const upgradeApprover = UPGRADE_APPROVER[chain];
    const approvers = new Set(
      [
        ...(account?.approvers.map((a) => a.address) ?? []),
        ...user.approvers.map((a) => a.address),
      ].filter((a) => a !== upgradeApprover),
    );
    const n = approvers.size;
    const details = getPolicyPresetDetails(n);

    return {
      low: {
        ...details.low,
        key: PolicyPresetKey.low,
        approvers,
        transfers: {
          defaultAllow: false,
          limits: {
            ...limit(chain, USDC, new Decimal(100), { day: 1 }),
            ...limit(chain, USDT, new Decimal(100), { day: 1 }),
            ...limit(chain, DAI, new Decimal(100), { day: 1 }),
          },
        },
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: false,
          },
          {
            ...ACTION_PRESETS.cancelDelayedTransactions,
            functions: ACTION_PRESETS.cancelDelayedTransactions.functions(accountAddress),
            allow: false,
          },
          {
            ...ACTION_PRESETS.syncswapSwap,
            functions: ACTION_PRESETS.syncswapSwap.functions(chain),
            allow: true,
          },
          {
            ...ACTION_PRESETS.syncswapLiquidity,
            functions: ACTION_PRESETS.syncswapLiquidity.functions(chain),
            allow: false,
          },
          { ...ACTION_PRESETS.all, allow: false },
        ],
        allowMessages: true,
        delay: 0,
      },
      medium: {
        ...details.medium,
        key: PolicyPresetKey.medium,
        approvers,
        transfers: {
          defaultAllow: false,
          limits: {
            ...limit(chain, USDC, new Decimal(500), { week: 1 }),
            ...limit(chain, USDT, new Decimal(500), { week: 1 }),
            ...limit(chain, DAI, new Decimal(500), { week: 1 }),
          },
        },
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: false,
          },
          {
            ...ACTION_PRESETS.cancelDelayedTransactions,
            functions: ACTION_PRESETS.cancelDelayedTransactions.functions(accountAddress),
            allow: true,
          },
          {
            ...ACTION_PRESETS.syncswapSwap,
            functions: ACTION_PRESETS.syncswapSwap.functions(chain),
            allow: true,
          },
          {
            ...ACTION_PRESETS.syncswapLiquidity,
            functions: ACTION_PRESETS.syncswapLiquidity.functions(chain),
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: true },
        ],
        allowMessages: true,
        delay: 0,
      },
      recovery: {
        ...details.recovery,
        key: PolicyPresetKey.recovery,
        approvers,
        transfers: { defaultAllow: false, limits: {} },
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: false },
        ],
        allowMessages: false,
        delay: Duration.fromObject({ week: 1 }).as('seconds'),
      },
      high: {
        ...details.high,
        key: PolicyPresetKey.high,
        approvers,
        transfers: { defaultAllow: true, limits: {} },
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: true,
          },
          {
            ...ACTION_PRESETS.cancelDelayedTransactions,
            functions: ACTION_PRESETS.cancelDelayedTransactions.functions(accountAddress),
            allow: true,
          },
          {
            ...ACTION_PRESETS.syncswapSwap,
            functions: ACTION_PRESETS.syncswapSwap.functions(chain),
            allow: true,
          },
          {
            ...ACTION_PRESETS.syncswapLiquidity,
            functions: ACTION_PRESETS.syncswapLiquidity.functions(chain),
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: true },
        ],
        allowMessages: true,
        delay: 0,
      },
      upgrade: {
        ...details.upgrade,
        key: PolicyPresetKey.upgrade,
        approvers: new Set([upgradeApprover]),
        transfers: { defaultAllow: false, limits: {} },
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: false },
        ],
        allowMessages: false,
        delay: Duration.fromObject({ week: 1 }).as('seconds'),
      },
    } satisfies Record<string, Omit<PolicyDraft, 'account'>>;
  }, [account?.address, account?.approvers, user.approvers, chain]);
}
