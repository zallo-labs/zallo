import { LogoIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { OnboardCarousel } from './OnboardCarousel';

export const OnboardScreen = () => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();

  return (
    <View style={styles.root}>
      <LogoIcon width={250} />
      <OnboardCarousel style={styles.margin} />

      <View style={[styles.actions, styles.margin]}>
        <Button
          mode="text"
          contentStyle={styles.action}
          style={styles.actionGap}
          onPress={() =>
            navigate('NameDevice', {
              onContinue: () => navigate('Device'),
            })
          }
        >
          I already have an account
        </Button>

        <Button
          mode="contained"
          contentStyle={styles.action}
          onPress={() =>
            navigate('NameDevice', {
              onContinue: () => navigate('CreateAccount', { onCreate: () => navigate('Home') }),
            })
          }
        >
          Create account
        </Button>
      </View>
    </View>
  );
};

const useStyles = makeStyles(({ space, window }) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    marginTop: space(6),
    marginBottom: space(2),
  },
  margin: {
    marginHorizontal: space(2),
  },
  actions: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  action: {
    width: window.width - space(2),
  },
  actionGap: {
    marginBottom: space(1),
  },
}));
