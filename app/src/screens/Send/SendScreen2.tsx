import { CloseIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { FIAT_DECIMALS } from '@token/fiat';
import { Address } from 'lib';
import { useState } from 'react';
import { View } from 'react-native';
import { Appbar, Button, Divider } from 'react-native-paper';
import { useSelectedAccountId } from '~/components/AccountSelector/useSelectedAccount';
import { useAddrName } from '~/components/addr/useAddrName';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { NumericInput } from '~/components/fields/NumericInput';
import { Screen } from '~/components/layout/Screen';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectedToken, useSetSelectedToken } from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';
import { useSelectToken } from '../tokens/useSelectToken';
import { InputsView, InputType } from './InputsView';

export interface SendScreenParams {
  to: Address;
}

export type SendScreenProps = StackNavigatorScreenProps<'Send'>;

export const SendScreen = withSuspense(({ route }: SendScreenProps) => {
  const { to } = route.params;
  const styles = useStyles();
  const account = useSelectedAccountId();
  const [token, setToken] = [useSelectedToken(), useSetSelectedToken()];
  const selectToken = useSelectToken();

  const [input, setInput] = useState('');
  const [type, setType] = useState(InputType.Fiat);

  return (
    <Screen safeArea="withoutTop">
      <Appbar.Header>
        <Appbar.Action icon={CloseIcon} onPress={useGoBack()} />
        <Appbar.Content title={`Send to ${useAddrName(to)}`} />
      </Appbar.Header>

      <InputsView input={input} setInput={setInput} type={type} setType={setType} />

      <View style={styles.spacer} />

      <TokenItem
        token={token}
        account={account}
        onPress={async () => setToken(await selectToken())}
      />
      <Divider horizontalInset />

      <NumericInput
        value={input}
        onChange={setInput}
        maxDecimals={type === InputType.Token ? token.decimals : FIAT_DECIMALS}
      />

      <Button mode="contained" style={styles.action}>
        Propose
      </Button>
    </Screen>
  );
}, ScreenSkeleton);

const useStyles = makeStyles(({ colors, fonts }) => ({
  spacer: {
    flex: 1,
  },
  action: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: 'stretch',
  },
}));
