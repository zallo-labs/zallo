import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { Button } from '#/Button';
import { Link } from 'expo-router';
import { TypewriterText } from './TypewriterText';
import { UAddress } from 'lib';

const SELLING_POINTS = [
  { text: 'self-custody' },
  { text: 'security that scales' },
  { text: 'fast & low-cost actions' },
  { text: 'onchain banking' },
  { text: 'Zallo.', completeDelay: 5000 },
];

export interface PrimarySectionProps {
  account?: UAddress;
}

export function PrimarySection({ account }: PrimarySectionProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.section}>
      <View style={styles.spacer} />

      <Text variant="displayLarge" style={styles.text}>
        Secure your digital assets {'\n'}with{' '}
        <TypewriterText
          values={SELLING_POINTS}
          loop
          minDelay={50}
          maxDelay={200}
          completeDelay={2000}
          style={styles.animatedText}
        />
      </Text>

      <Text variant="headlineSmall" style={styles.text}>
        Secure your digital assets with self-custodial banking on zkSync Era. Access your account
        seamlessly across devices, and enjoy practical self-custody with security that scales
      </Text>

      <View style={styles.actionsContainer}>
        <View style={styles.actions}>
          {account ? (
            <Link href={{ pathname: `/(drawer)/[account]/(home)/`, params: { account } }} asChild>
              <Button mode="contained" style={styles.action}>
                View account
              </Button>
            </Link>
          ) : (
            <Link href="/onboard/account" asChild>
              <Button mode="contained" style={styles.action}>
                Get started
              </Button>
            </Link>
          )}

          <Button mode="text">Learn more</Button>
        </View>
      </View>
    </View>
  );
}

const stylesheet = createStyles(({ colors, fonts }) => ({
  section: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    marginVertical: 16,
  },
  text: {
    color: colors.onPrimaryContainer,
  },
  animatedText: {
    ...fonts.displayLarge,
    color: colors.tertiary,
  },
  actionsContainer: {
    flexGrow: {
      compact: 1,
      medium: undefined,
    },
    justifyContent: 'flex-end',
  },
  actions: {
    flexDirection: {
      compact: 'column',
      medium: 'row',
    },
    marginVertical: 8,
    columnGap: 16,
    rowGap: 8,
  },
  action: {
    minWidth: {
      compact: 200,
      medium: 200,
    },
    flexGrow: {
      compact: 1,
      medium: undefined,
    },
  },
  spacer: {
    flex: {
      compact: 1,
      medium: undefined,
    },
  },
}));
