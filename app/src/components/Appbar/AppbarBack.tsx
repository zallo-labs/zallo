import { BackIcon, IconProps } from '@theme/icons';
import { useRouter } from 'expo-router';
import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';

type AppbarBackProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export const AppbarBack = (props: Partial<AppbarBackProps>) => {
  const router = useRouter();

  return <Appbar.BackAction disabled={!router.canGoBack()} onPress={router.back} {...props} />;
};

export interface AppbarBack2Props extends IconProps {
  onPress?: () => void;
}

export function AppbarBack2(props: AppbarBack2Props) {
  const router = useRouter();

  if (!router.canGoBack()) return null;

  return <BackIcon onPress={router.back} {...props} />;
}
