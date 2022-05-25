import { ChildrenProps } from '@util/children';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Box, BoxProps } from './Box';

export type ScreenScrollRootProps = ChildrenProps & BoxProps;

export const ScreenScrollRoot = ({
  children,
  ...boxProps
}: ScreenScrollRootProps) => (
  <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <Box {...boxProps}>{children}</Box>
  </KeyboardAwareScrollView>
);
