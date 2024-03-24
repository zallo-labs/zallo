import { createStyles, useStyles } from '@theme/styles';
import { Dispatch, memo, SetStateAction, useCallback } from 'react';
import { View } from 'react-native';
import { Button, type ButtonProps } from '../Button';
import { materialIcon } from '@theme/icons';

const BackspaceIcon = materialIcon('keyboard-backspace');

const DECIMAL_SEPARATOR = Intl.NumberFormat().formatToParts(0.1)[1]?.value || '.';

interface BProps extends ButtonProps {
  onChange?: Dispatch<SetStateAction<string>>;
}

const B = memo(({ onChange, ...props }: BProps) => {
  const { styles } = useStyles(stylesheet);
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
  const { styles } = useStyles(stylesheet);

  const decimalPointIndex = value.indexOf('.');
  const decimals = decimalPointIndex !== -1 ? value.length - decimalPointIndex - 1 : 0;
  const disableNum = !!maxDecimals && decimals >= maxDecimals;

  const addDecimal = useCallback(() => onChange((v) => (v.length ? `${v}.` : '0.')), [onChange]);
  const pop = useCallback(() => onChange((v) => v.slice(0, v.length - 1)), [onChange]);
  const clear = useCallback(() => onChange(''), [onChange]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <B onChange={onChange} disabled={disableNum}>
          1
        </B>
        <B onChange={onChange} disabled={disableNum}>
          2
        </B>
        <B onChange={onChange} disabled={disableNum}>
          3
        </B>
      </View>

      <View style={styles.row}>
        <B onChange={onChange} disabled={disableNum}>
          4
        </B>
        <B onChange={onChange} disabled={disableNum}>
          5
        </B>
        <B onChange={onChange} disabled={disableNum}>
          6
        </B>
      </View>

      <View style={styles.row}>
        <B onChange={onChange} disabled={disableNum}>
          7
        </B>
        <B onChange={onChange} disabled={disableNum}>
          8
        </B>
        <B onChange={onChange} disabled={disableNum}>
          9
        </B>
      </View>

      <View style={styles.row}>
        <B onPress={addDecimal} disabled={decimalPointIndex !== -1 || maxDecimals === 0}>
          {DECIMAL_SEPARATOR}
        </B>

        <B onChange={onChange} disabled={disableNum}>
          0
        </B>

        <B onPress={pop} onLongPress={clear} disabled={!value.length}>
          {<BackspaceIcon size={styles.buttonLabel.fontSize} />}
        </B>
      </View>
    </View>
  );
};

const stylesheet = createStyles(({ colors, fonts }) => ({
  container: {
    flexDirection: 'column',
    margin: 16,
  },
  row: {
    flexDirection: 'row',
  },
  buttonContainer: {
    flex: 1,
  },
  buttonLabel: {
    ...fonts.displayMedium,
  },
  buttonColor: {
    color: colors.onSurface,
  },
}));
