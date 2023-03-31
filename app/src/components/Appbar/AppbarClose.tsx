import { CloseIcon, IconProps } from '@theme/icons';
import { IconButton } from 'react-native-paper';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';

export interface AppbarCloseProps extends IconProps {}

export const AppbarClose = (props: AppbarCloseProps) => {
  const { goBack, canGoBack } = useRootNavigation2();

  return <IconButton {...props} icon={CloseIcon} onPress={goBack} disabled={!canGoBack} />;
};
