import { ProposalId, useProposal } from '@api/proposal';
import { useGasPrice } from '@network/useGasPrice';
import { CheckIcon, ClockOutlineIcon, GasOutlineIcon } from '@theme/icons';
import { ETH } from '@token/tokens';
import { useTokenValue } from '@token/useTokenValue';
import _ from 'lodash';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { Timestamp } from '~/components/format/Timestamp';
import { ListItem, ListItemTextProps } from '~/components/list/ListItem';
import { TokenIcon } from '~/components/token/TokenIcon/TokenIcon';
import { useFeeToken } from '~/components/token/useFeeToken';
import { clog } from '~/util/format';
import { TabNavigatorScreenProp } from './Tabs';

export interface ExecutionTabParams {
  proposal: ProposalId;
}

export type ExecutionTabProps = TabNavigatorScreenProp<'Execution'>;

export const ExecutionTab = ({ route }: ExecutionTabProps) => {
  const proposal = useProposal(route.params.proposal);
  const tx = proposal.transaction;
  const resp = tx?.response;

  const feeToken = useFeeToken();
  const gasPrice = useGasPrice();
  const maxFeeValue = useTokenValue(feeToken, gasPrice * (tx?.gasLimit ?? 0n));
  // TODO: use actual fee token
  const actualFeeValue = useTokenValue(ETH, resp ? resp.gasUsed * resp.effectiveGasPrice : 0n);

  clog(proposal);

  if (!tx)
    return (
      <View>
        <Text variant="bodyLarge" style={styles.unsatisfiedText}>
          The proposal will execute once a policy is satisfied.
        </Text>
      </View>
    );

  const trailing =
    (children: ReactNode) =>
    ({ Text }: ListItemTextProps) =>
      <Text style={styles.trailing}>{children}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ListItem
        leading={CheckIcon}
        headline="Status"
        trailing={trailing(_.upperFirst(tx.status))}
      />
      <ListItem
        leading={ClockOutlineIcon}
        headline="Submitted"
        trailing={trailing(<Timestamp timestamp={tx.timestamp} />)}
      />
      {resp && (
        <ListItem
          leading={ClockOutlineIcon}
          headline="Executed"
          trailing={trailing(<Timestamp timestamp={resp.timestamp} />)}
        />
      )}
      <ListItem
        leading={GasOutlineIcon}
        headline="Gas limit"
        trailing={trailing(<FormattedNumber value={tx.gasLimit} />)}
      />
      {resp ? (
        <ListItem
          leading={(props) => <TokenIcon token={feeToken} {...props} />}
          headline="Network fee"
          trailing={trailing(<FiatValue value={actualFeeValue} />)}
        />
      ) : (
        <ListItem
          leading={(props) => <TokenIcon token={feeToken} {...props} />}
          headline="Estimated network fee"
          trailing={trailing(<FiatValue value={maxFeeValue} />)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  unsatisfiedText: {
    textAlign: 'center',
  },
  trailing: {},
});
