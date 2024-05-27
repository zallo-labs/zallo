import { IconProps } from '@theme/icons';
import { useStyles } from '@theme/styles';
import { useRouter, useSegments } from 'expo-router';
import type { ExpoRouter } from 'expo-router/types/expo-router';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Drawer } from 'react-native-paper';
import { useDrawerActions } from '#/drawer/DrawerContextProvider';

export interface DrawerItemProps
  extends Pick<ComponentPropsWithoutRef<typeof Drawer.Item>, 'onPress'> {
  href: ExpoRouter.Href;
  label: string;
  icon?: FC<IconProps>;
  disabled?: boolean;
}

export function DrawerItem({ href, label, icon: Icon, disabled, ...props }: DrawerItemProps) {
  const currentPath = `/${useSegments().join('/')}`;
  const hrefPath = getHrefPath(href);
  const router = useRouter();
  const { close } = useDrawerActions();
  const { stateLayer } = useStyles().theme;

  return (
    // <Link href={href} asChild>
    <Drawer.Item
      label={label}
      icon={Icon ? (props) => <Icon {...props} /> : undefined}
      active={currentPath === hrefPath}
      {...(disabled && {
        onPress: undefined,
        icon: Icon && ((props) => <Icon {...props} color={stateLayer(props.color, 'disabled')} />),
      })}
      {...props}
      onPress={(e) => {
        close();
        props.onPress ? props.onPress(e) : router.navigate(href);
      }}
    />
    // </Link>
  );
}

function getHrefPath(href: ExpoRouter.Href) {
  let p: string = typeof href === 'string' ? href : href.pathname;
  if (p.endsWith('/')) p = p.slice(0, p.length - 1);
  return p;
}
