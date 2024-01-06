import { match, P } from 'ts-pattern';

import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import {
  IconProps,
  PolicyActiveIcon,
  PolicyActiveOutlineIcon,
  PolicyAddIcon,
  PolicyAddOutlineIcon,
  PolicyEditIcon,
  PolicyEditOutlineIcon,
  PolicyRemoveIcon,
  PolicyRemoveOutlineIcon,
} from '~/util/theme/icons';

const Policy = gql(/* GraphQL */ `
  fragment PolicyIcon_Policy on Policy {
    id
    state {
      id
    }
    draft {
      id
      isRemoved
    }
  }
`);

export interface PolicyIconProps extends IconProps {
  policy: FragmentType<typeof Policy>;
  filled?: boolean;
}

export const PolicyIcon = ({
  policy: policyFragment,
  filled = false,
  ...iconProps
}: PolicyIconProps) => {
  const policy = useFragment(Policy, policyFragment);

  const icons = match(policy)
    .with({ state: P.nullish }, () => [PolicyAddOutlineIcon, PolicyAddIcon] as const)
    .with({ draft: P.nullish }, () => [PolicyActiveOutlineIcon, PolicyActiveIcon] as const)
    .with(
      { draft: { isRemoved: true } },
      () => [PolicyRemoveOutlineIcon, PolicyRemoveIcon] as const,
    )
    .otherwise(() => [PolicyEditOutlineIcon, PolicyEditIcon] as const);

  const Icon = icons[Number(filled)]!;
  return <Icon {...iconProps} />;
};
