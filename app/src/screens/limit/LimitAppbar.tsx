import { DeleteIcon } from '@theme/icons';
import { Appbar } from 'react-native-paper';
import { AppbarExtraContent } from '~/components/Appbar/AppbarExtraContent';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { ProposableButton } from '~/components/ProposableStatus/ProposableButton';
import { Proposable } from '~/gql/proposable';
import { TokenLimit } from '~/queries/wallets';

export interface LimitAppbarProps {
  proposable?: Proposable<TokenLimit>;
  remove: () => void;
}

export const LimitAppbar = ({ proposable, remove }: LimitAppbarProps) => {
  return (
    <Appbar.Header mode="large">
      <Appbar.BackAction onPress={useGoBack()} />

      {proposable && (
        <AppbarExtraContent>
          <ProposableButton proposable={proposable} />
        </AppbarExtraContent>
      )}

      <Appbar.Content title="Spending limit" />

      <Appbar.Action icon={DeleteIcon} onPress={remove} />
    </Appbar.Header>
  );
};
