import { Box, BoxProps } from '~/components/layout/Box';

export interface AppbarCenterContentProps extends BoxProps {}

export const AppbarCenterContent = (props: AppbarCenterContentProps) => (
  <Box
    flex={1}
    horizontal
    alignItems="center"
    justifyContent="center"
    mx={2}
    {...props}
  />
);
