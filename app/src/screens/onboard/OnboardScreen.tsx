import { LogoIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { View } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { OnboardCarousel } from './OnboardCarousel';

export type OnboardScreenProps = StackNavigatorScreenProps<'Onboard'>;

export const OnboardScreen = ({ navigation: { navigate } }: OnboardScreenProps) => {
  const styles = useStyles();

  return (
    <View style={styles.root}>
      <LogoIcon width={styles.logo.width} style={styles.logo} />

      <OnboardCarousel style={styles.carousel} />

      <View style={styles.actions}>
        <Button
          mode="text"
          style={styles.secondaryAction}
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
          onPress={() =>
            navigate('NameDevice', {
              onContinue: () =>
                navigate('CreateAccount', {
                  onCreate: () => navigate('BottomNavigator', { screen: 'Home' }),
                }),
            })
          }
        >
          Create account
        </Button>
      </View>
    </View>
  );
};

const useStyles = makeStyles(({ space, s }) => ({
  root: {
    flex: 1,
    marginTop: space(6),
    marginBottom: space(2),
  },
  logo: {
    alignSelf: 'center',
    width: 250,
  },
  carousel: {
    marginHorizontal: s(16),
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: s(16),
  },
  secondaryAction: {
    marginBottom: s(8),
  },
}));
