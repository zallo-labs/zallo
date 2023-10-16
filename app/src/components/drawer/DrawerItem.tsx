import { Href, Link, useRouter, useSegments } from 'expo-router';
import { ComponentPropsWithoutRef } from 'react';
import { Drawer } from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';
import { useDrawerContext } from '~/components/drawer/DrawerContextProvider';

export interface DrawerItemProps<R>
  extends Pick<ComponentPropsWithoutRef<typeof Drawer.Item>, 'onPress'> {
  href: Href<R>;
  label: string;
  icon?: IconSource;
}

export function DrawerItem<R>({ href, label, icon, ...props }: DrawerItemProps<R>) {
  const currentPath = `/${useSegments().join('/')}`;
  const hrefPath = getHrefPath(href);
  const router = useRouter();
  const { close } = useDrawerContext();

  return (
    // <Link href={href} asChild>
    <Drawer.Item
      label={label}
      icon={icon}
      active={currentPath === hrefPath}
      onPress={() => {
        router.push(href);
        close();
      }}
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
