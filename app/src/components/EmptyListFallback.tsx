import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { FC, ReactNode } from 'react';
import { useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';

export interface EmptyListFallbackProps {
  Icon?: FC<IconProps> | ReactNode;
  title: string;
  subtitle?: string;
  isScreenRoot?: boolean;
}

export const EmptyListFallback = ({
  Icon,
  title,
  subtitle,
  isScreenRoot = false,
}: EmptyListFallbackProps) => {
  const styles = useStyles();
  const { height } = useWindowDimensions();

  return (
    // Set height manually since flex={1} doesn't work within FlexList on Android
    <Box
      flex={1}
      height={height}
      alignItems="center"
      {...(isScreenRoot && { mt: 8 })}
    >
      {typeof Icon === 'function' ? (
        <Icon color={styles.icon.color} size={styles.icon.fontSize} />
      ) : (
        Icon
      )}

      <Text variant="headlineMedium" style={[styles.text, styles.title]}>
        {title}
      </Text>
      <Text variant="titleMedium" style={styles.text}>
        {subtitle}
      </Text>
    </Box>
  );
};

const useStyles = makeStyles(({ colors, iconSize, space }) => ({
  icon: {
    color: colors.onBackground,
    fontSize: iconSize.large,
  },
  title: {
    marginVertical: space(2),
  },
  text: {
    textAlign: 'center',
  },
}));
