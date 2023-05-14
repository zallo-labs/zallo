import { LinkingOptions } from '@react-navigation/native';
import { asHex } from 'lib';

type Routes = NonNullable<LinkingOptions<ReactNavigation.RootParamList>['config']>;

export const ROUTES: Routes = {
  initialRouteName: 'Home',
  screens: {
    Proposal: {
      path: 'proposal/:hash',
      parse: {
        hash: (hash) => ({ hash: asHex(hash) }),
      },
    },
    Home: '*',
  },
};
