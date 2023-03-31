import { BackIcon, IconProps } from '@theme/icons';
import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';

type BackActionProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export const AppbarBack = (props: Partial<BackActionProps>) => {
  const navigation = useRootNavigation();

  return (
    <Appbar.BackAction disabled={!navigation.canGoBack()} onPress={navigation.goBack} {...props} />
  );
};

export interface AppbarBack2Props extends IconProps {
  onPress?: (goBack: () => void) => void;
}

export const AppbarBack2 = ({ onPress, ...props }: AppbarBack2Props) => {
  const { goBack, canGoBack } = useRootNavigation();

  return (
    <BackIcon
      {...props}
      disabled={!canGoBack()}
      onPress={onPress ? () => onPress(goBack) : goBack}
    />
  );
};
