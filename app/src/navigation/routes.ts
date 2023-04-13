import { LinkingOptions } from '@react-navigation/native';
import { RootParamList2 } from './useRootNavigation';

type Routes = NonNullable<LinkingOptions<RootParamList2>['config']>;

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
