import { CloseIcon, IconProps } from '@theme/icons';
import { useRootNavigation2 } from '~/navigation/useRootNavigation';

export interface AppbarCloseProps extends IconProps {}

export const AppbarClose = (props: AppbarCloseProps) => {
  const { goBack, canGoBack } = useRootNavigation2();

  return <CloseIcon {...props} onPress={goBack} disabled={!canGoBack} />;
};
