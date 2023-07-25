import { FragmentType, gql, useFragment } from '@api/generated';
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
} from '@theme/icons';
import { match } from 'ts-pattern';

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
    .with({ state: undefined }, () => [PolicyAddOutlineIcon, PolicyAddIcon] as const)
    .with({ draft: undefined }, () => [PolicyActiveOutlineIcon, PolicyActiveIcon] as const)
    .with(
      { draft: { isRemoved: true } },
      () => [PolicyRemoveOutlineIcon, PolicyRemoveIcon] as const,
    )
    .otherwise(() => [PolicyEditOutlineIcon, PolicyEditIcon] as const);

  const Icon = icons[Number(filled)]!;
  return <Icon {...iconProps} />;
};
