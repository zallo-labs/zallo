import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import { ZalloLogo, TwitterIcon, GithubIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { CONFIG } from '~/util/config';

export function LandingHeader() {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <ZalloLogo style={styles.logo} contentFit="contain" />

      <View style={styles.trailing}>
        <Link href={CONFIG.metadata.twitter} asChild>
          <TwitterIcon style={styles.icon} />
        </Link>

        <Link href={CONFIG.metadata.github} asChild>
          <GithubIcon style={styles.icon} />
        </Link>
      </View>
    </View>
  );
}

const stylesheet = createStyles(({ colors, iconSize }, { insets }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8 + insets.top,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 24,
    backgroundColor: colors.primaryContainer,
  },
  logo: {
    height: 60,
    width: 156,
  },
  trailing: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 32,
  },
  icon: {
    width: iconSize.small,
    height: iconSize.small,
    color: colors.onPrimaryContainer,
  },
}));
