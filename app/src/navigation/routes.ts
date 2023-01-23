import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from './useRootNavigation';

type Routes = NonNullable<LinkingOptions<RootStackParamList>['config']>;

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
