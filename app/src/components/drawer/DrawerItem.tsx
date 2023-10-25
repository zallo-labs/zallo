import { IconProps } from '@theme/icons';
import { useTheme } from '@theme/paper';
import { Href, Link, useRouter, useSegments } from 'expo-router';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Drawer } from 'react-native-paper';
import { useDrawerActions } from '~/components/drawer/DrawerContextProvider';

export interface DrawerItemProps<R>
  extends Pick<ComponentPropsWithoutRef<typeof Drawer.Item>, 'onPress'> {
  href: Href<R>;
  label: string;
  icon?: FC<IconProps>;
  disabled?: boolean;
}

export function DrawerItem<R>({ href, label, icon: Icon, disabled, ...props }: DrawerItemProps<R>) {
  const currentPath = `/${useSegments().join('/')}`;
  const hrefPath = getHrefPath(href);
  const router = useRouter();
  const { close } = useDrawerActions();
  const { stateLayer } = useTheme();

  return (
    // <Link href={href} asChild>
    <Drawer.Item
      label={label}
      icon={Icon}
      active={currentPath === hrefPath}
      onPress={() => {
        router.push(href);
        close();
      }}
      {...(disabled && {
        onPress: undefined,
        icon: Icon && ((props) => <Icon {...props} color={stateLayer(props.color, 'disabled')} />),
      })}
      {...props}
    />
    // </Link>
  );
}

function getHrefPath<R>(href: Href<R>) {
  let p = typeof href === 'string' ? href : href.pathname;
  if (p.endsWith('/')) p = p.slice(0, p.length - 1);
  return p;
}
