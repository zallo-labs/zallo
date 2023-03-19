import { makeStyles } from '@theme/makeStyles';
import { Avatar, AvatarTextProps } from 'react-native-paper';

export interface LabelIconProps extends Omit<AvatarTextProps, 'theme'> {}

export const LabelIcon = ({ label: l, ...props }: LabelIconProps) => {
  const styles = useStyles();

  const label = l.slice(0, Math.min(l?.length, 1)).toUpperCase();

  return (
    <Avatar.Text
      size={styles.size.fontSize}
      label={label}
      style={styles.container}
      labelStyle={styles.label}
      {...props}
    />
  );
};

const useStyles = makeStyles(({ colors, iconSize }) => ({
  container: {
    backgroundColor: colors.tertiaryContainer,
  },
  label: {
    color: colors.tertiary,
  },
  size: {
    fontSize: iconSize.medium,
  },
}));
