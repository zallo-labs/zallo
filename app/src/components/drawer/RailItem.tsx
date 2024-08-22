import { IconProps } from '@theme/icons';
import { Href, useRouter } from 'expo-router';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Drawer } from 'react-native-paper';
import { usePath } from '#/usePath';

export interface RailItemProps
  extends Pick<ComponentPropsWithoutRef<typeof Drawer.CollapsedItem>, 'onPress'> {
  href: Href;
  label: string;
  icon?: FC<IconProps>;
}

export function RailItem({ href, label, icon: Icon, ...props }: RailItemProps) {
  const router = useRouter();
  const currentPath = usePath();
  const hrefPath = getHrefPath(href);

  return (
    // <Link href={href} asChild>
    <Drawer.CollapsedItem
      label={label}
      focusedIcon={Icon}
      unfocusedIcon={Icon}
      active={currentPath.includes(hrefPath)}
      {...props}
      onPress={(e) => {
        props.onPress ? props.onPress(e) : router.navigate(href);
      }}
    />
    // </Link>
  );
}

function getHrefPath(href: Href) {
  let p: string = typeof href === 'string' ? href : href.pathname;
  if (p.endsWith('/')) p = p.slice(0, p.length - 1);
  return p;
}
