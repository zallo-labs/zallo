import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';

export const Logo = () => <Text style={useStyles().logo}>Zallo</Text>;

const useStyles = makeStyles(({ fonts }) => ({
  logo: {
    ...fonts.displayLarge,
    fontSize: 75,
    fontWeight: '500', // medium
  },
}));
