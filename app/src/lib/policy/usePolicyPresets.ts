import {
  AccountIcon,
  IconProps,
  SwapIcon,
  imageFromSource,
  materialCommunityIcon,
  materialIcon,
} from '@theme/icons';
import { PolicyDraft, PolicyDraftAction } from './draft';
import { FragmentType, gql, useFragment } from '@api';
import { ACCOUNT_ABI, Address, PLACEHOLDER_ACCOUNT_ADDRESS, asAddress, asSelector } from 'lib';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { getAbiItem, toFunctionSelector } from 'viem';
import { SYNCSWAP, ERC721_ABI } from 'lib/dapps';
import { Chain } from 'chains';

type ActionDefinition = Omit<PolicyDraftAction, 'allow'> & { icon?: FC<IconProps> };

export const ACTION_PRESETS = {
  all: {
    icon: materialIcon('circle'),
    label: 'Anything else',
    functions: [{}],
  },
  transferNfts: {
    icon: imageFromSource(require('assets/ENS.svg')),
    label: 'Transfer NFTs',
    functions: [
      getAbiItem({ abi: ERC721_ABI, name: 'safeTransferFrom', args: ['0x', '0x', 0n] }),
      getAbiItem({ abi: ERC721_ABI, name: 'safeTransferFrom', args: ['0x', '0x', 0n, '0x'] }),
      getAbiItem({ abi: ERC721_ABI, name: 'transferFrom' }),
      getAbiItem({ abi: ERC721_ABI, name: 'approve' }),
      getAbiItem({ abi: ERC721_ABI, name: 'setApprovalForAll' }),
    ].map((f) => ({ selector: asSelector(toFunctionSelector(f)) })),
  },
  manageAccount: {
    icon: AccountIcon,
    label: 'Manage account',
    functions: (account: Address) =>
      [
        getAbiItem({ abi: ACCOUNT_ABI, name: 'addPolicy' }),
        getAbiItem({ abi: ACCOUNT_ABI, name: 'removePolicy' }),
        getAbiItem({ abi: ACCOUNT_ABI, name: 'upgradeToAndCall' }),
      ].map((f) => ({
        contract: account,
        selector: asSelector(toFunctionSelector(f)),
      })),
  },
  syncswapSwap: {
    icon: SwapIcon,
    label: 'Swap (SyncSwap)',
    functions: (chain: Chain) =>
      [
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swap' }),
        getAbiItem({ abi: SYNCSWAP.router.abi, name: 'swapWithPermit' }),
      ].map((f) => ({
        contract: SYNCSWAP.router.address[chain],
        selector: asSelector(toFunctionSelector(f)),
      })),
  },
  syncswapLiquidity: {
    icon: materialCommunityIcon('water'),
    label: 'Manage liquidity (SyncSwap)',
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
      })),
  },
} satisfies Record<
  string,
  | ActionDefinition
  | (Omit<ActionDefinition, 'functions'> & {
      functions: (...params: any[]) => ActionDefinition['functions'];
    })
>;

const Account = gql(/* GraphQL */ `
  fragment UsePolicyPresets_Account on Account {
    id
    address
    approvers {
      id
      address
    }
  }
`);

const User = gql(/* GraphQL */ `
  fragment UsePolicyPresets_User on User {
    id
    approvers {
      id
      address
    }
  }
`);

export interface UsePolicyPresetsParams {
  account: FragmentType<typeof Account> | null | undefined;
  user: FragmentType<typeof User>;
  chain: Chain;
}

export function usePolicyPresets({ chain, ...params }: UsePolicyPresetsParams) {
  const account = useFragment(Account, params.account);
  const user = useFragment(User, params.user);

  return useMemo(() => {
    const accountAddress = asAddress(account?.address) ?? PLACEHOLDER_ACCOUNT_ADDRESS;
    const approvers = new Set([
      ...(account?.approvers.map((a) => a.address) ?? []),
      ...user.approvers.map((a) => a.address),
    ]);

    return {
      low: {
        name: 'Low risk',
        approvers,
        threshold: 1,
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
            allow: false,
          },
          {
            ...ACTION_PRESETS.syncswapSwap,
            functions: ACTION_PRESETS.syncswapSwap.functions(chain),
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: false },
        ],
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $x
        allowMessages: true,
      },
      medium: {
        name: 'Medium risk',
        approvers,
        threshold: Math.max(approvers.size > 3 ? 3 : 2, approvers.size),
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
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
            allow: true,
          },
          { ...ACTION_PRESETS.all, allow: true },
        ],
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $y
        allowMessages: true,
      },
      high: {
        name: 'High risk',
        approvers,
        threshold: _.clamp(approvers.size - 2, 1, 5),
        actions: [
          {
            ...ACTION_PRESETS.manageAccount,
            functions: ACTION_PRESETS.manageAccount.functions(accountAddress),
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
        transfers: { defaultAllow: true, limits: {} },
        allowMessages: true,
      },
    } satisfies Record<string, Omit<PolicyDraft, 'account' | 'key'>>;
  }, [account?.address, account?.approvers, user.approvers, chain]);
}
