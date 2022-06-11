import { STYLES } from '@util/styles';
import { Pressable } from 'react-native';
import { Subheading } from 'react-native-paper';

export interface ExecuteButtonProps {
  onPress: () => void;
  color: string;
  children: string;
}

export const TimelineButton = ({
  onPress,
  color,
  children,
}: ExecuteButtonProps) => (
  <Pressable onPress={onPress}>
    <Subheading
      style={{
        color,
        fontWeight: 'bold',
        ...STYLES.dropShadow,
      }}
    >
      {children.toUpperCase()}
    </Subheading>
  </Pressable>
);
