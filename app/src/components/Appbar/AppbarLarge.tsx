import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Arraylike, toArray } from 'lib';
import { FC, ReactNode } from 'react';
import { Surface, Text } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { AppbarBack2 } from './AppbarBack';
import { AppbarMenu2 } from './AppbarMenu';

export interface AppbarLargeContentProps {
  leading: FC<IconProps> | 'back' | 'menu';
  trailing?: Arraylike<FC<IconProps>>;
  headline: ReactNode;
  supporting?: ReactNode;
  center?: boolean;
  elevated?: boolean;
}

export const AppbarLarge = ({
  leading,
  trailing,
  headline: Headline,
  supporting: Supporting,
  center,
  elevated,
}: AppbarLargeContentProps) => {
  const styles = useStyles({ center, insets: useSafeAreaInsets() });

  const Leading = leading === 'back' ? AppbarBack2 : leading === 'menu' ? AppbarMenu2 : leading;

  return (
    <Surface elevation={elevated ? 2 : 0} style={styles.root}>
      <Box style={styles.headerContainer}>
        <Box style={styles.leadingIconContainer}>
          <Leading size={styles.leadingIcon.fontSize} color={styles.leadingIcon.color} />
        </Box>

        {trailing && (
          <Container
            style={styles.trailingContainer}
            separator={<Box style={styles.trailingIconSeparator} />}
          >
            {toArray(trailing).map((Trailing, index) => (
              <Trailing
                key={index}
                size={styles.trailingIcon.fontSize}
                color={styles.trailingIcon.color}
              />
            ))}
          </Container>
        )}
      </Box>

      <Box style={styles.textContainer}>
        <Text variant="headlineMedium" style={styles.headline}>
          {Headline}
        </Text>

        {Supporting && (
          <Text variant="bodyMedium" style={styles.supporting}>
            {Supporting}
          </Text>
        )}
      </Box>
    </Surface>
  );
};

interface StyleOptions {
  center?: boolean;
  insets: EdgeInsets;
}

const useStyles = makeStyles(({ s, colors }, { center, insets }: StyleOptions) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    height: 152 + insets.top,
    paddingTop: s(20) + insets.top,
    paddingBottom: s(28),
    paddingHorizontal: s(16),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIconContainer: {
    flex: 1,
  },
  leadingIcon: {
    color: colors.onSurface,
    fontSize: s(24),
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailingIconSeparator: {
    marginLeft: s(24),
  },
  trailingIcon: {
    color: colors.onSurfaceVariant,
    fontSize: s(24),
  },
  textContainer: {
    alignItems: center ? 'center' : 'flex-start',
  },
  headline: {
    color: colors.onSurface,
  },
  supporting: {
    color: colors.onSurfaceVariant,
  },
}));
