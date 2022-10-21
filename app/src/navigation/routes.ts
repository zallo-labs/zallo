import { LinkingOptions } from '@react-navigation/native';
import { RootNavigatorParamList } from './RootNavigator';

type Routes = NonNullable<LinkingOptions<RootNavigatorParamList>['config']>;

export const ROUTES: Routes = {
  initialRouteName: 'DrawerNavigator',
  screens: {
    Transaction: {
      path: 'transaction/:id',
      parse: {
        id: (id) => ({ hash: id }),
      },
    },
    DrawerNavigator: {
      screens: {
        BottomNavigator: {
          screens: {
            Home: '*',
          },
        },
      },
    },
  },
};
