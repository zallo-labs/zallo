import {
  AccountIcon,
  IconProps,
  SwapIcon,
  imageFromSource,
  materialCommunityIcon,
  materialIcon,
} from '@theme/icons';
import { PolicyDraft, PolicyDraftAction } from './draft';
import { FragmentType, gql, useFragment as getFragment } from '@api';
import { ACCOUNT_ABI, Address, asAddress, asSelector } from 'lib';
import _ from 'lodash';
import { FC, useMemo } from 'react';
import { getAbiItem, toFunctionSelector } from 'viem';
import { useApproverAddress } from '~/lib/network/useApprover';
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
  fragment getPolicyPresets_Account on Account {
    id
    address
    approvers {
      id
      address
    }
  }
`);

export interface UsePolicyPresetsParams {
  account: FragmentType<typeof Account> | null | undefined;
  chain: Chain;
}

export function usePolicyPresets({ chain, ...params }: UsePolicyPresetsParams) {
  const account = getFragment(Account, params.account);
  const approver = useApproverAddress();
  const accountAddress = asAddress(account?.address);

  return useMemo(() => {
    const approvers = new Set([approver, ...(account?.approvers.map((a) => a.address) ?? [])]);

    return {
      low: {
        name: 'Low risk',
        approvers,
        threshold: 1,
        actions: [
          accountAddress && {
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
        ].filter(Boolean),
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $x
      },
      medium: {
        name: 'Medium risk',
        approvers,
        threshold: Math.max(approvers.size > 3 ? 3 : 2, approvers.size),
        actions: [
          accountAddress && {
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
        ].filter(Boolean),
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $y
      },
      high: {
        name: 'High risk',
        approvers,
        threshold: _.clamp(approvers.size - 2, 1, 5),
        actions: [
          accountAddress && {
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
        ].filter(Boolean),
        transfers: { defaultAllow: true, limits: {} },
      },
    } satisfies Record<string, Omit<PolicyDraft, 'account' | 'key'>>;
  }, [chain, account?.approvers, accountAddress, approver]);
}
