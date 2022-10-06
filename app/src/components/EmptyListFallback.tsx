import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { FC, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { Headline, Title } from 'react-native-paper';
import { Box } from '~/components/layout/Box';

export interface EmptyListFallbackProps {
  Icon?: FC<IconProps> | ReactNode;
  title: string;
  subtitle?: string;
}

export const EmptyListFallback = ({
  Icon,
  title,
  subtitle,
}: EmptyListFallbackProps) => {
  const styles = useStyles();
  const { height } = useWindowDimensions();

  return (
    // Set height manually since flex={1} doesn't work within FlexList on Android
    <Box flex={1} height={height} alignItems="center">
      {typeof Icon === 'function' ? (
        <Icon color={styles.icon.color} size={styles.icon.fontSize} />
      ) : (
        Icon
      )}

      <Box my={10}>
        <Headline style={styles.text}>{title}</Headline>
      </Box>

      <Title style={styles.text}>{subtitle}</Title>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  icon: {
    color: colors.onBackground,
    fontSize: iconSize.medium,
  },
  text: {
    textAlign: 'center',
  },
}));
