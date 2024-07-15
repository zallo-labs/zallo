import { BackIcon, IconProps } from '@theme/icons';
import { useRouter } from 'expo-router';
import { ComponentPropsWithoutRef } from 'react';
import { Appbar } from 'react-native-paper';

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

  return (
    <BackIcon onPress={() => (router.canGoBack() ? router.back() : router.push('/'))} {...props} />
  );
}
