import { match, P } from 'ts-pattern';

import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { TokenIcon } from '~/components/token/TokenIcon';
import { FragmentType, gql, useFragment } from '~/gql/api';
import {
  DataIcon,
  IconProps,
  PolicyEditOutlineIcon,
  PolicyRemoveOutlineIcon,
  SwapIcon,
} from '~/util/theme/icons';

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

export function OperationIcon({ operation: opProp, chain, ...iconProps }: OperationIconProps) {
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

  return <Icon {...iconProps} />;
}
