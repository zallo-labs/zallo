import { Proposal, useUpdateProposal } from '@api/proposal';
import { NavigateNextIcon } from '@theme/icons';
import { useToken } from '@token/useToken';
import { ListItem } from '~/components/list/ListItem';
import { useSelectToken } from '../tokens/TokensScreen';
import { useGasPrice } from '@network/useGasPrice';
import { TokenAmount, useFormattedTokenAmount } from '~/components/token/TokenAmount';

export interface FeeTokenProps {
  proposal: Proposal;
}

export function FeeToken({
  proposal: { account, hash, feeToken, updatable, transaction: tx, gasLimit },
}: FeeTokenProps) {
  const token = useToken(feeToken);
  const update = useUpdateProposal();
  const selectToken = useSelectToken();

  const estimatedFee = useGasPrice(token) * gasLimit;
  const actualFee = tx?.receipt && tx.receipt.gasUsed * tx.gasPrice;

  return (
    <ListItem
      leading={feeToken}
      headline="Network fee"
      supporting={({ Text }) => (
        <Text>
          {actualFee ? (
            <TokenAmount token={token} amount={-actualFee} />
          ) : (
            `≤ ${useFormattedTokenAmount({ token, amount: -estimatedFee })}`
          )}
        </Text>
      )}
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
