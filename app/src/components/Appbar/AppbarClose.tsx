import { CloseIcon, IconProps } from '@theme/icons';
import { useNavigation } from '@react-navigation/native';

export interface AppbarCloseProps extends IconProps {}

export const AppbarClose = (props: AppbarCloseProps) => {
  const { goBack, canGoBack } = useNavigation();

  return <CloseIcon {...props} onPress={goBack} disabled={!canGoBack} />;
};
