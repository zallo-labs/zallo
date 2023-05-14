import { WPolicy } from '@api/policy';
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

export interface PolicyIconProps extends IconProps {
  policy: WPolicy;
  filled?: boolean;
}

export const PolicyIcon = ({ policy, filled = false, ...iconProps }: PolicyIconProps) => {
  const icons = match(policy)
    .with({ state: undefined }, () => [PolicyAddOutlineIcon, PolicyAddIcon] as const)
    .with({ draft: undefined }, () => [PolicyActiveOutlineIcon, PolicyActiveIcon] as const)
    .with({ draft: null }, () => [PolicyRemoveOutlineIcon, PolicyRemoveIcon] as const)
    .otherwise(() => [PolicyEditOutlineIcon, PolicyEditIcon] as const);

  const Icon = icons[Number(filled)]!;
  return <Icon {...iconProps} />;
};
