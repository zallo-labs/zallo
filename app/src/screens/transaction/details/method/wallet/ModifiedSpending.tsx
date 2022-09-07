import { useToken } from '@token/useToken';
import { address, Address } from 'lib';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { TokenAmount } from '~/components/token/TokenAmount';
import { isProposed } from '~/gql/proposable';
import { Limits, LIMIT_PERIOD_LABEL, TokenLimit } from '~/queries/wallets';
import { ModifiedProposableRow } from './ModifiedProposableRow';

interface ModifiedTokenLimitProps {
  tokenAddr: Address;
  limit: TokenLimit;
}

const ModifiedTokenLimit = ({ tokenAddr, limit }: ModifiedTokenLimitProps) => {
  const token = useToken(tokenAddr);

  return (
    <Text>
      <TokenAmount token={token} amount={limit.amount} />
      {` ${LIMIT_PERIOD_LABEL[limit.period]}`}
    </Text>
  );
};

export interface ModifiedSpendingProps {
  limits: Limits;
}

export const ModifiedSpending = ({ limits }: ModifiedSpendingProps) => {
  const modifiedTokens = Object.entries(limits.tokens).filter(([, value]) =>
    isProposed(value),
  );

  if (!isProposed(limits.allowlisted) && modifiedTokens.length === 0)
    return null;

  return (
    <Container separator={<Box mt={1} />} mt={2}>
      <Text variant="titleSmall">Spending</Text>

      <ModifiedProposableRow proposable={limits.allowlisted}>
        {({ value }) => (
          <Text>
            {`Spending ${value ? '' : 'NOT '}restricted to tokens listed`}
          </Text>
        )}
      </ModifiedProposableRow>

      {modifiedTokens.map(([token, limit]) => (
        <ModifiedProposableRow key={token} proposable={limit}>
          {({ value }) => (
            <ModifiedTokenLimit tokenAddr={address(token)} limit={value} />
          )}
        </ModifiedProposableRow>
      ))}
    </Container>
  );
};
