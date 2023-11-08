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
import { ACCOUNT_ABI, Address, ERC721_ABI, asSelector } from 'lib';
import _ from 'lodash';
import { FC } from 'react';
import { getAbiItem, getFunctionSelector } from 'viem';
import { SYNCSWAP_ROUTER } from '~/util/swap/syncswap/contracts';

export const getActionPresets = (account: Address) =>
  ({
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
      ].map((f) => ({ selector: asSelector(getFunctionSelector(f)) })),
    },
    manageAccount: {
      icon: AccountIcon,
      label: 'Manage account',
      functions: [
        getAbiItem({ abi: ACCOUNT_ABI, name: 'addPolicy' }),
        getAbiItem({ abi: ACCOUNT_ABI, name: 'removePolicy' }),
        getAbiItem({ abi: ACCOUNT_ABI, name: 'upgradeTo' }),
        getAbiItem({ abi: ACCOUNT_ABI, name: 'upgradeToAndCall' }),
      ].map((f) => ({
        contract: account,
        selector: asSelector(getFunctionSelector(f)),
      })),
    },
    syncswapSwap: {
      icon: SwapIcon,
      label: 'Swap (SyncSwap)',
      functions: [
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'swap' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'swapWithPermit' }),
      ].map((f) => ({
        contract: SYNCSWAP_ROUTER.address,
        selector: asSelector(getFunctionSelector(f)),
      })),
    },
    syncswapLiquidity: {
      icon: materialCommunityIcon('water'),
      label: 'Manage liquidity (SyncSwap)',
      functions: [
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'addLiquidity' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'addLiquidity2' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'addLiquidityWithPermit' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'addLiquidityWithPermit2' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'burnLiquidity' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'burnLiquiditySingle' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'burnLiquiditySingleWithPermit' }),
        getAbiItem({ abi: SYNCSWAP_ROUTER.abi, name: 'burnLiquidityWithPermit' }),
      ].map((f) => ({
        contract: SYNCSWAP_ROUTER.address,
        selector: asSelector(getFunctionSelector(f)),
      })),
    },
  }) satisfies Record<string, Omit<PolicyDraftAction, 'allow'> & { icon?: FC<IconProps> }>;

const Account = gql(/* GraphQL */ `
  fragment getPolicyTemplate_Account on Account {
    id
    address
    approvers {
      id
      address
    }
  }
`);

export function getPolicyPresets(accountFragment: FragmentType<typeof Account>) {
  const account = getFragment(Account, accountFragment);
  const actions = getActionPresets(account.address);

  const approvers = new Set(account.approvers.map((a) => a.address));

  return {
    low: {
      name: 'Low risk',
      approvers,
      threshold: 1,
      actions: [
        { ...actions.syncswapSwap, allow: true },
        { ...actions.all, allow: false },
      ],
      transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $x
    },
    medium: {
      name: 'Medium risk',
      approvers,
      threshold: Math.max(approvers.size > 3 ? 3 : 2, approvers.size),
      actions: [
        { ...actions.syncswapSwap, allow: true },
        { ...actions.syncswapLiquidity, allow: true },
        { ...actions.all, allow: true },
      ],
      transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $y
    },
    high: {
      name: 'High risk',
      approvers,
      threshold: _.clamp(approvers.size - 2, 1, 5),
      actions: [
        { ...actions.manageAccount, allow: true },
        { ...actions.syncswapSwap, allow: true },
        { ...actions.syncswapLiquidity, allow: true },
        { ...actions.all, allow: true },
      ],
      transfers: { defaultAllow: true, limits: {} },
    },
  } satisfies Record<string, Omit<PolicyDraft, 'account' | 'key'>>;
}
