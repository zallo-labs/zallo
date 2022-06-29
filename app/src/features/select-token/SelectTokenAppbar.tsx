import { Appbar } from 'react-native-paper';
import { AppbarBack } from '@components/AppbarBack';

export const SelectTokenAppbar = () => {
  return (
    <Appbar.Header>
      <AppbarBack />

      <Appbar.Content title="Tokens" />

      <Appbar.Action icon="magnify" onPress={() => alert('Search')} />
    </Appbar.Header>
  );
};
