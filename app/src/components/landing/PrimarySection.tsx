import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { Button } from '#/Button';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';

const DEFAULT_DELAY = 3000;
const VALUES = [
  { text: 'self-custody' },
  { text: 'security that scales' },
  { text: 'fast & low-cost transactions' },
  // 'access across devices',
  { text: 'onchain banking' },
  { text: 'Zallo', delay: 6000 },
];

export function PrimarySection() {
  const { styles } = useStyles(stylesheet);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    const setTimer = (i: number) => {
      timer = setTimeout(() => {
        setIndex((i) => {
          const next = i < VALUES.length - 1 ? i + 1 : 0;
          setTimer(next);

          return next;
        });
      }, VALUES[i].delay ?? DEFAULT_DELAY);
    };

    setTimer(0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.section}>
      <View style={styles.spacer} />

      <Text variant="displayLarge" style={styles.text}>
        Secure your digital assets {'\n'}with{' '}
        <Animated.Text key={index} style={styles.animatedText} entering={FadeIn}>
          {VALUES[index].text}
        </Animated.Text>
      </Text>

      <Text variant="headlineSmall" style={styles.text}>
        Secure your digital assets with self-custodial banking on zkSync Era. Access your account
        seamlessly across devices, and enjoy practical self-custody with security that scales
      </Text>

      <View style={styles.actionsContainer}>
        <View style={styles.actions}>
          <Link href="/onboard/account" asChild>
            <Button mode="contained" style={styles.action}>
              Get started
            </Button>
          </Link>

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
    // flexDirection: 'row',
    // flexWrap: 'wrap-reverse',
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
