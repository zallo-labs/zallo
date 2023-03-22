import { MaterialIcons } from '@expo/vector-icons';
import { makeStyles } from '@theme/makeStyles';
import { Dispatch, memo, SetStateAction, useCallback } from 'react';
import { View } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

const DECIMAL_SEPARATOR = Intl.NumberFormat().formatToParts(0.1)[1]?.value || '.';

interface BProps extends ButtonProps {
  onChange?: Dispatch<SetStateAction<string>>;
}

const B = memo(({ onChange, ...props }: BProps) => {
  const styles = useStyles();
  return (
    <Button
      mode="text"
      style={styles.buttonContainer}
      labelStyle={styles.buttonLabel}
      textColor={styles.buttonColor.color}
      {...(typeof props.children === 'string' &&
        onChange && {
          onPress: () => onChange((value) => `${value}${props.children}`),
        })}
      {...props}
    />
  );
});

export interface NumericInputProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  maxDecimals?: number;
}

export const NumericInput = ({ value, onChange, maxDecimals }: NumericInputProps) => {
  const styles = useStyles();

  const decimalPointIndex = value.indexOf('.');
  const decimals = decimalPointIndex !== -1 ? value.length - decimalPointIndex - 1 : 0;
  const disableNum = !!maxDecimals && decimals >= maxDecimals;

  const pop = useCallback(() => onChange((v) => v.slice(0, v.length - 1)), [onChange]);
  const clear = useCallback(() => onChange(''), [onChange]);

  return (
    <View style={styles.container}>
      {[...new Array(9)].map((_, i) => (
        <B key={i} onChange={onChange} disabled={disableNum}>{`${i + 1}`}</B>
      ))}

      <B onChange={onChange} disabled={decimalPointIndex !== -1 || maxDecimals === 0}>
        {DECIMAL_SEPARATOR}
      </B>

      <B onChange={onChange} disabled={disableNum}>
        0
      </B>

      <B onPress={pop} onLongPress={clear} disabled={!value.length}>
        {<MaterialIcons name="keyboard-backspace" size={styles.buttonLabel.fontSize} />}
      </B>
    </View>
  );
};

const useStyles = makeStyles(({ colors, fonts }) => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  buttonContainer: {
    flex: 1,
    flexBasis: '30%',
    alignSelf: 'stretch',
  },
  buttonLabel: {
    ...fonts.displayMedium,
  },
  buttonColor: {
    color: colors.onSurface,
  },
}));
