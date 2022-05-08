import { Box } from './Box';

export interface HeaderProps {
  middle: React.ReactNode;
  right: React.ReactNode;
}

export const Header = ({ middle, right }: HeaderProps) => (
  <Box horizontal alignItems="center">
    <Box flex={2} horizontal justifyContent="flex-end">
      {middle}
    </Box>

    <Box flex={1} horizontal justifyContent="flex-end">
      {right}
    </Box>
  </Box>
);
