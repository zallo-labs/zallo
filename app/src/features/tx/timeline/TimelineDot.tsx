import { Box, BoxProps } from '@components/Box';

const WIDTH = 5;

export interface TimelineDotProps extends BoxProps {
  color: BoxProps['backgroundColor'];
}

export const TimelineDot = ({ color, ...boxProps }: TimelineDotProps) => {
  return (
    <Box
      borderRadius={WIDTH}
      borderStyle="solid"
      borderWidth={WIDTH}
      borderColor={color}
      {...boxProps}
    />
  );
};
