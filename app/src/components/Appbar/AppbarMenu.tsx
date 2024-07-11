import { materialCommunityIcon } from '@theme/icons';
import { ComponentPropsWithoutRef, FC } from 'react';
import { useDrawerActions, useNavType } from '#/drawer/DrawerContextProvider';
import { ICON_SIZE } from '@theme/paper';
import { View } from 'react-native';
import { IconButton } from '#/IconButton';

export const MenuIcon = materialCommunityIcon('menu');

type BaseProps = Omit<ComponentPropsWithoutRef<typeof MenuIcon>, 'onPress'>;

export interface AppbarMenuProps extends BaseProps {
  fallback?: FC<BaseProps>;
}

export function AppbarMenu({ fallback: Fallback, ...props }: AppbarMenuProps) {
  const type = useNavType();
  const { toggle } = useDrawerActions();

  if (type !== 'modal')
    return Fallback ? (
      <Fallback {...props} />
    ) : (
      <View style={{ width: ICON_SIZE.medium, height: ICON_SIZE.medium }} />
    );

  return <IconButton icon={MenuIcon} onPress={toggle} size={ICON_SIZE.medium} {...props} />;
}
