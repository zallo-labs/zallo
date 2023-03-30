import { isPresent } from 'lib';
import { memo } from 'react';
import { StyleProp, StyleSheet, TranslateXTransform, ViewStyle } from 'react-native';
import { Badge, BadgeProps } from 'react-native-paper';

type SmallBadgeProps = { visible: boolean };
type LargeBageProps = { value: number; max?: number };

const isLarge = (props: SmallBadgeProps | LargeBageProps): props is LargeBageProps =>
  'value' in props;

export type TabBadgeProps = {
  style?: StyleProp<ViewStyle>;
} & (SmallBadgeProps | LargeBageProps);

export const TabBadge = memo(({ style, ...props }: TabBadgeProps) => {
  const value = isLarge(props)
    ? (() => {
        const max = props.max || 9;
        return props.value > max ? `${max}+` : `${props.value}`;
      })()
    : '';

  const flattened: ViewStyle | undefined = StyleSheet.flatten(style);
  const translateX = flattened?.transform?.find((t): t is TranslateXTransform => 'translateX' in t);

  const width = flattened?.width || isLarge(props) ? 12 + 4 * value.length : 6;

  console.log(translateX);

  const transform = [
    translateX ? { translateX: translateX.translateX - width } : undefined,
    { translateY: 8 },
  ].filter(isPresent);

  return (
    <Badge
      visible={isLarge(props) ? props.value > 0 : props.visible}
      size={isLarge(props) ? 16 : 6}
      style={[
        ...(isLarge(props) ? [styles.large, { width: 12 + 4 * value.length }] : [styles.small]),
        style,
        { width, transform },
      ]}
    >
      {value}
    </Badge>
  );
});

const styles = StyleSheet.create({
  small: {
    transform: [{ translateY: 8 }],
  },
  large: {
    transform: [{ translateY: 8 }],
  },
});
