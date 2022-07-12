import { Box, BoxProps } from '@components/Box';
import { ReactNode } from 'react';
import { Paragraph } from 'react-native-paper';

export interface CallDetailsRowProps extends BoxProps {
  title: string;
  content: ReactNode;
}

export const CallDetailsRow = ({
  title,
  content,
  ...boxProps
}: CallDetailsRowProps) => {
  return (
    <Box horizontal {...boxProps}>
      <Box flex={1}>
        <Paragraph>{title}</Paragraph>
      </Box>

      <Box flex={2} horizontal justifyContent="flex-end">
        {content}
      </Box>
    </Box>
  );
};
