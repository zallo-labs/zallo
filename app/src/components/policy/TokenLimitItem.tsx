import { FragmentType, gql, useFragment as getFragment } from '@api';
import { NavigateNextIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { Address, TransferLimit, asDecimal } from 'lib';
import _ from 'lodash';
import { Duration } from 'luxon';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { useFormattedTokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';
import { usePolicyDraft } from '~/lib/policy/draft';
import { truncateAddr } from '~/util/format';
import { useLocalParams } from '~/hooks/useLocalParams';
import { PolicyScreenParams } from '~/app/(drawer)/[account]/policies/[id]';

const Token = gql(/* GraphQL */ `
  fragment TokenLimitItem_Token on Token {
    name
    decimals
    ...TokenIcon_Token
    ...UseFormattedTokenAmount_token
  }
`);

export interface TokenSpendingProps {
  address: Address;
  token: FragmentType<typeof Token> | null | undefined;
}

export function TokenLimitItem({ address, ...props }: TokenSpendingProps) {
  const token = getFragment(Token, props.token);
  const params = useLocalParams(PolicyScreenParams);
  const [policy] = usePolicyDraft();

  const limit: TransferLimit | undefined = policy.transfers.limits[address];
  // TODO: make limit.amount a decimal
  const formattedAmount = useFormattedTokenAmount({
    token,
    amount: token && limit ? asDecimal(limit.amount, token?.decimals) : 0,
  });
  const duration = Duration.fromObject({ seconds: limit?.duration ?? 0 });

  return (
    <Link
      href={{
        pathname: `/(drawer)/[account]/policies/[id]/spending/[token]`,
        params: { ...params, token: address },
      }}
      asChild
    >
      <ListItem
        leading={(props) =>
          token ? (
            <TokenIcon token={token} {...props} />
          ) : (
            <AddressIcon address={address} {...props} />
          )
        }
        headline={token?.name ?? truncateAddr(address)}
        trailing={(props) => (
          <ListItemHorizontalTrailing>
            <ListItemTrailingText>
              {!limit?.amount
                ? 'Not allowed'
                : `${formattedAmount} per ${prettyDuration(duration)}`}
            </ListItemTrailingText>
            <NavigateNextIcon {...props} />
          </ListItemHorizontalTrailing>
        )}
      />
    </Link>
  );
}

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
