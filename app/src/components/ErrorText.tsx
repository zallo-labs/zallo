import { FC, ReactNode } from 'react';
import { Paragraph, useTheme } from 'react-native-paper';

interface RequiredProps {
  style: {
    color: string;
  };
  children: ReactNode;
}

export interface ErrorTextProps<Props extends RequiredProps> {
  error: string | false;
  as?: FC<Props>;
  props?: Props;
}

export const ErrorText = <Props extends RequiredProps>({
  error,
  as: Component,
  props,
}: ErrorTextProps<Props>) => {
  const { colors } = useTheme();

  return Component ? (
    <Component {...props} style={[props?.style ?? {}, { color: colors.error }]}>
      {error}
    </Component>
  ) : (
    <Paragraph style={{ color: colors.error }}>{error}</Paragraph>
  );
};
