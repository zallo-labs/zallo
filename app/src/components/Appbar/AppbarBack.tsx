import { BackIcon, IconProps } from '@theme/icons';
import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

type BackActionProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export const AppbarBack = (props: Partial<BackActionProps>) => {
  const navigation = useNavigation();

  return (
    <Appbar.BackAction disabled={!navigation.canGoBack()} onPress={navigation.goBack} {...props} />
  );
};

export interface AppbarBack2Props extends IconProps {
  onPress?: () => void;
}

export const AppbarBack2 = (props: AppbarBack2Props) => {
  const { goBack, canGoBack, navigate } = useNavigation();

  return <BackIcon onPress={canGoBack() ? goBack : () => navigate('Home', {})} {...props} />;
};
