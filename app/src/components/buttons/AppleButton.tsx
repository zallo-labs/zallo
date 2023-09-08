import { makeStyles } from '@theme/makeStyles';
import AppleIconSvg from '../../../assets/apple.svg';
import { Fab } from './Fab';

export interface AppleButtonProps {
  onLink?: () => void;
}

export function AppleButton({ onLink }: AppleButtonProps) {
  const styles = useStyles();

  return (
    <Fab
      position="relative"
      icon={(props) => (
        <AppleIconSvg fill={styles.icon.color} style={{ aspectRatio: 1, width: props.size }} />
      )}
      style={styles.container}
    />
  );
}

const useStyles = makeStyles(({ dark }) => ({
  container: {
    backgroundColor: dark ? 'white' : 'black',
  },
  icon: {
    color: dark ? 'black' : 'white',
  },
}));
