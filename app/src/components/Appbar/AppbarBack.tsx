import { ComponentPropsWithoutRef } from 'react';
import { useRouter } from 'expo-router';
import { Appbar } from 'react-native-paper';

import { BackIcon, IconProps } from '~/util/theme/icons';

type AppbarBackContainedProps = ComponentPropsWithoutRef<typeof Appbar.BackAction>;

export function AppbarBackContained(props: Partial<AppbarBackContainedProps>) {
  const router = useRouter();

  return <Appbar.BackAction disabled={!router.canGoBack()} onPress={router.back} {...props} />;
}

export interface AppbarBackProps extends IconProps {
  onPress?: () => void;
}

export function AppbarBack(props: AppbarBackProps) {
  const router = useRouter();

  if (!router.canGoBack()) return null;

  return <BackIcon onPress={router.back} {...props} />;
}
