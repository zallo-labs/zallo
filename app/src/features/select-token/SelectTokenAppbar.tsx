import { Appbar } from 'react-native-paper';
import { AppbarRoot } from '@components/AppbarRoot';
import { AppbarBack } from '@components/AppbarBack';

export const SelectTokenAppbar = () => {
  return (
    <AppbarRoot>
      <AppbarBack />

      <Appbar.Content title="Tokens" />

      <Appbar.Action icon="magnify" onPress={() => alert('Search')} />
    </AppbarRoot>
  );
};
