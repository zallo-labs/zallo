import { FC, ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';

import { createStyles, useStyles } from '~/util/theme/styles';
import { TextProps } from '~/util/theme/types';

export interface TrailingItemProps {
  Text: FC<TextProps>;
}

export interface ListHeaderProps extends TextProps {
  trailing?: string | ReactNode | FC<TrailingItemProps>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const ListHeader = ({
  trailing: Trailing,
  containerStyle,
  style: textStyle,
  ...props
}: ListHeaderProps) => {
  const { styles } = useStyles(stylesheet);

  const TrailingText = ({ style, ...props }: TextProps) => (
    <Text
      variant="titleSmall"
      numberOfLines={1}
      {...props}
      style={[styles.trailingText, textStyle, style]}
    />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text variant="titleSmall" style={styles.header} {...props} />
      {typeof Trailing === 'function' ? (
        <Trailing Text={TrailingText} />
      ) : (
        <TrailingText>{Trailing}</TrailingText>
      )}
    </View>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
    marginHorizontal: 16,
  },
  header: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  trailingText: {
    color: colors.onSurfaceVariant,
  },
}));
