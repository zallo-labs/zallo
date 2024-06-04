import { FragmentType, gql, useFragment as getFragment } from '@api';
import { Address, TransferLimit, asDecimal } from 'lib';
import _ from 'lodash';
import { Duration } from 'luxon';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem } from '#/list/ListItem';
import { useFormattedTokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';
import { usePolicyDraft } from '~/lib/policy/draft';
import { truncateAddr } from '~/util/format';
import { Chevron } from '#/Chevron';
import { useState } from 'react';
import { TokenSpending } from './TokenSpending';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';

const Token = gql(/* GraphQL */ `
  fragment TokenLimitItem_Token on Token {
    name
    decimals
    ...TokenIcon_Token
    ...UseFormattedTokenAmount_token
  }
`);

export interface TokenLimitItemProps {
  address: Address;
  token: FragmentType<typeof Token> | null | undefined;
}

export function TokenLimitItem({ address, ...props }: TokenLimitItemProps) {
  const { styles } = useStyles(stylesheet);
  const token = getFragment(Token, props.token);
  const [policy] = usePolicyDraft();

  const [expanded, setExpanded] = useState(false);

  const limit: TransferLimit | undefined = policy.transfers.limits[address];
  // TODO: make limit.amount a decimal
  const formattedAmount = useFormattedTokenAmount({
    token,
    amount: token && limit ? asDecimal(limit.amount, token?.decimals) : 0,
  });
  const duration = Duration.fromObject({ seconds: limit?.duration ?? 0 });

  return (
    <View style={styles.surface}>
      <ListItem
        leading={token ? <TokenIcon token={token} /> : <AddressIcon address={address} />}
        headline={token?.name ?? truncateAddr(address)}
        supporting={
          limit?.amount ? `${formattedAmount} per ${prettyDuration(duration)}` : 'Not allowed'
        }
        trailing={<Chevron expanded={expanded} />}
        onPress={() => setExpanded(!expanded)}
      />

      {expanded && <TokenSpending token={address} />}
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  surface: {
    backgroundColor: colors.surface,
  },
}));

function prettyDuration(duration: Duration) {
  const normalized = Duration.fromDurationLike(duration)
    .normalize()
    .shiftTo('years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds');

  const minified = _.pickBy(normalized.toObject(), (v) => v !== 0);
  if (Object.keys(minified).length === 1 && Object.values(minified)[0] === 1) {
    const unit = Object.keys(minified)[0];
    return unit.endsWith('s') ? unit.slice(0, unit.length - 1) : unit;
  }

  return Duration.fromObject(minified).toHuman();
}
