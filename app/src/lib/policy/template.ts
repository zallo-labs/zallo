import { PolicyDraft } from './draft';
import { ALLOW_ALL_TARGETS, ALLOW_ALL_TRANSFERS_CONFIG } from 'lib';
import { FragmentType, gql, useFragment as getFragment } from '@api';
import _ from 'lodash';

const Account = gql(/* GraphQL */ `
  fragment getPolicyTemplate_Account on Account {
    id
    approvers {
      id
      address
    }
  }
`);

export type PolicyTemplateType = 'low' | 'medium' | 'high';

export function getPolicyTemplates(
  accountFragment: FragmentType<typeof Account> | null | undefined,
): Record<
  PolicyTemplateType,
  Pick<PolicyDraft, 'name' | 'permissions' | 'approvers' | 'threshold'>
> {
  const account = getFragment(Account, accountFragment);

  const approvers = new Set(account?.approvers.map((a) => a.address));

  return {
    low: {
      name: 'Low risk',
      permissions: {
        targets: { default: { defaultAllow: false, functions: {} }, contracts: {} },
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $x
      },
      approvers,
      threshold: 1,
    },
    medium: {
      name: 'Medium risk',
      permissions: {
        targets: ALLOW_ALL_TARGETS,
        transfers: { defaultAllow: false, limits: {} }, // TODO: allow transfers up to $y
      },
      approvers,
      threshold: Math.max(approvers.size > 3 ? 3 : 2, approvers.size),
    },
    high: {
      name: 'High risk',
      permissions: {
        targets: ALLOW_ALL_TARGETS,
        transfers: ALLOW_ALL_TRANSFERS_CONFIG,
      },
      approvers,
      threshold: _.clamp(approvers.size - 2, 1, 5),
    },
  };
}
