import { useNavigation } from '@react-navigation/native';

import { CloseIcon, IconProps } from '~/util/theme/icons';

export interface AppbarCloseProps extends IconProps {}

export const AppbarClose = (props: AppbarCloseProps) => {
  const { goBack, canGoBack } = useNavigation();

  return <CloseIcon {...props} onPress={goBack} disabled={!canGoBack} />;
};
