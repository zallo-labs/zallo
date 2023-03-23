import { makeStyles } from '@theme/makeStyles';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

export interface ActionButtonProps extends Omit<ButtonProps, 'theme'> {
  containerStyle?: StyleProp<ViewStyle>;
}

export const ActionButton = ({ containerStyle, ...props }: ActionButtonProps) => {
  const styles = useStyles();

  return (
    <View style={[styles.container, containerStyle]}>
      <Button mode="contained" {...props} />
    </View>
  );
};

const useStyles = makeStyles((_) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 16,
    marginHorizontal: 16,
  },
}));
