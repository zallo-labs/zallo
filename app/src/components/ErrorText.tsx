import { FC, ReactNode } from 'react';
import { Paragraph, useTheme } from 'react-native-paper';

interface RequiredProps {
  style: {
    color: string;
  };
  children: ReactNode;
}

export interface ErrorTextProps {
  error: string | false;
  children?: FC<RequiredProps>;
}

export const ErrorText = ({
  error,
  children: Component = Paragraph,
}: ErrorTextProps) => {
  const { colors } = useTheme();

  return <Component style={{ color: colors.error }}>{error}</Component>;
};
