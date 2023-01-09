import { LinkingOptions } from '@react-navigation/native';
import { RootParamList } from './useRootNavigation';

type Routes = NonNullable<LinkingOptions<RootParamList>['config']>;

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
