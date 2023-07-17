import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import LogoSvg from '~/../assets/logo-color.svg';
import { Actions } from '~/components/layout/Actions';
import { StyleSheet } from 'react-native';
import { Screen } from '~/components/layout/Screen';

export type OnboardScreenProps = StackNavigatorScreenProps<'Onboard'>;

export function OnboardScreen({ navigation: { navigate } }: OnboardScreenProps) {
  return (
    <Screen topInset>
      <View style={styles.header}>
        <LogoSvg style={styles.logo} />
        <Text variant="headlineSmall" style={styles.description}>
          Permission-based{'\n'}self-custodial smart wallet
        </Text>
      </View>

      <Actions>
        <Button mode="contained" style={styles.button} onPress={() => navigate('CreateUser')}>
          Get started
        </Button>
      </Actions>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  logo: {
    marginBottom: 32,
  },
  description: {
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
  },
});
