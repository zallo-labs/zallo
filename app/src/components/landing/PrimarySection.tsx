import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { Button } from '#/Button';
import { Link } from 'expo-router';
import { TypewriterText, TypewriterValue } from './TypewriterText';
import { UAddress } from 'lib';
import { CONFIG } from '~/util/config';
import { mq } from 'react-native-unistyles';

const SELLING_POINTS = [
  { text: 'self-custody' },
  { text: 'security that scales' },
  { text: 'low fees' },
  { text: 'onchain banking' },
  { text: 'Zallo.', completeDelay: 5000 },
] satisfies TypewriterValue[];

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
        Secure your digital assets with self-custodial banking on zkSync Era.{'\n'}
        Access your account seamlessly and confidently with security that scales.
      </Text>

      <View style={styles.actionsContainer}>
        <View style={styles.actions}>
          {account ? (
            <Link href={{ pathname: `/(nav)/[account]/(home)/`, params: { account } }} asChild>
              <Button mode="contained" style={styles.primaryAction}>
                View account
              </Button>
            </Link>
          ) : (
            <Link href="/onboard/user" asChild>
              <Button mode="contained" style={styles.primaryAction}>
                Get started
              </Button>
            </Link>
          )}

          <Link href={CONFIG.docsUrl} asChild target="_blank">
            <Button mode="text" style={styles.action}>
              Learn more
            </Button>
          </Link>
        </View>
      </View>
    </View>
  );
}

const stylesheet = createStyles(({ colors, fonts }) => {
  const action = {
    flexGrow: {
      [mq.only.width(0, 'medium')]: 1,
    },
  } as const;

  return {
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
        [mq.only.width(0, 'medium')]: 1,
      },
      justifyContent: 'flex-end',
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap-reverse',
      marginVertical: 8,
      columnGap: 16,
      rowGap: 8,
    },
    primaryAction: {
      minWidth: 200,
      ...action,
    },
    action,
    spacer: {
      flex: {
        [mq.only.width(0, 'medium')]: 1,
      },
    },
  };
});
