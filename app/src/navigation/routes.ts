import { LinkingOptions } from '@react-navigation/native';

type Routes = NonNullable<LinkingOptions<ReactNavigation.RootParamList>['config']>;

export const ROUTES: Routes = {
  initialRouteName: 'Home',
  screens: {
    Proposal: {
      path: 'proposal/:id',
      parse: {
        id: (id) => ({ hash: id }),
      },
    },
    Home: '*',
  },
};
