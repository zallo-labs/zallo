import { Proposal, useUpdateProposal } from '@api/proposal';
import { NavigateNextIcon } from '@theme/icons';
import { useToken } from '@token/useToken';
import { ListItem } from '~/components/list/ListItem';
import { useSelectToken } from '../tokens/TokensScreen';

export interface FeeTokenProps {
  proposal: Proposal;
}

export function FeeToken({ proposal: { account, hash, feeToken, updatable } }: FeeTokenProps) {
  const token = useToken(feeToken);
  const update = useUpdateProposal();
  const selectToken = useSelectToken();

  return (
    <ListItem
      leading={feeToken}
      headline="Fee token"
      supporting={token.name}
      trailing={NavigateNextIcon}
      {...(updatable && {
        onPress: async () => {
          const token = await selectToken({ account });
          await update({ hash, feeToken: token.address });
        },
      })}
    />
  );
}
