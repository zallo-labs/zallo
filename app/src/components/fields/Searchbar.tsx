import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { toArray } from 'lib';
import { FC } from 'react';
import { View } from 'react-native';
import { Surface } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box } from '../layout/Box';
import { Container } from '../layout/Container';
import { BasicTextField, BasicTextFieldProps } from './BasicTextField';

export interface SearchbarProps extends BasicTextFieldProps {
  leading?: FC<IconProps>;
  trailing?: FC<IconProps> | FC<IconProps>[];
  placeholder: string;
  inset?: boolean;
}

export const Searchbar = ({
  leading: Leading,
  trailing,
  inset = true,
  ...inputProps
}: SearchbarProps) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles(inset ? insets : undefined);

  return (
    <Surface elevation={3} style={styles.container}>
      {Leading && (
        <Box style={styles.leadingContainer}>
          {<Leading size={styles.leadingIcon.fontSize} color={styles.leadingIcon.color} />}
        </Box>
      )}

      <BasicTextField {...inputProps} style={[styles.input, inputProps.style]} />

      <View style={styles.trailingContainer}>
        {toArray(trailing ?? []).map((Trailing, i) => (
          <Trailing key={i} size={styles.trailingIcon.fontSize} color={styles.trailingIcon.color} />
        ))}
      </View>

      {trailing && (
        <Container style={styles.trailingContainer} separator={<Box mr={2} />}></Container>
      )}
    </Surface>
  );
};

const useStyles = makeStyles(({ colors, corner, fonts }, insets?: EdgeInsets) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    minWidth: 360,
    maxWidth: 720,
    borderRadius: corner.full,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16 + (insets?.top ?? 0),
    marginBottom: 8,
  },
  leadingContainer: {
    paddingRight: 16,
  },
  leadingIcon: {
    fontSize: 24,
    color: colors.onSurface,
  },
  input: {
    flex: 1,
    ...fonts.bodyLarge,
  },
  inputPlaceholder: {
    color: colors.onSurfaceVariant,
  },
  trailingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trailingIcon: {
    fontSize: 24,
    color: colors.onSurfaceVariant,
  },
}));
