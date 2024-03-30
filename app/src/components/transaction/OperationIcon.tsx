import { FragmentType, gql, useFragment } from '@api';
import {
  DataIcon,
  IconProps,
  PolicyEditOutlineIcon,
  PolicyRemoveOutlineIcon,
  SwapIcon,
} from '@theme/icons';
import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { P, match } from 'ts-pattern';
import { TokenIcon } from '#/token/TokenIcon';
import { ICON_SIZE } from '@theme/paper';

const Operation = gql(/* GraphQL */ `
  fragment OperationIcon_Operation on Operation {
    function {
      __typename
      ... on TransferlikeOp {
        token
      }
    }
  }
`);

export interface OperationIconProps extends IconProps {
  operation: FragmentType<typeof Operation>;
  chain: Chain;
}

export function OperationIcon({
  operation: opProp,
  chain,
  size = ICON_SIZE.medium,
  ...iconProps
}: OperationIconProps) {
  const op = useFragment(Operation, opProp);

  const Icon = match(op.function)
    .with({ __typename: 'UpdatePolicyOp' }, () => PolicyEditOutlineIcon)
    .with({ __typename: 'RemovePolicyOp' }, () => PolicyRemoveOutlineIcon)
    .with(
      P.union(
        { __typename: 'TransferOp' },
        { __typename: 'TransferFromOp' },
        { __typename: 'TransferApprovalOp' },
      ),
      (f) => (props: IconProps) => <TokenIcon {...props} token={asUAddress(f.token, chain)} />,
    )
    .with({ __typename: 'SwapOp' }, () => SwapIcon)
    .otherwise(() => DataIcon);

  return <Icon size={size} {...iconProps} />;
}
