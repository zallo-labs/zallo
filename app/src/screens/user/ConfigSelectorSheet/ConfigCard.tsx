import { makeStyles } from '@theme/makeStyles';
import { UserConfig } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { Card } from '~/components/card/Card';

export interface ConfigCardProps {
  config: UserConfig;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ConfigCard = ({ config, selected, onPress, style }: ConfigCardProps) => {
  const styles = useStyles(selected);

  return (
    <Card onPress={onPress} style={[styles.card, style]} elevation={3}>
      {config.approvers.length > 0 ? (
        <>
          {config.approvers.map((approver) => (
            <Text key={approver} variant="bodyMedium" style={styles.onBackground}>
              <Addr addr={approver} />
            </Text>
          ))}
        </>
      ) : (
        <Text variant="bodyMedium">Without approval</Text>
      )}
    </Card>
  );
};

const useStyles = makeStyles(({ colors, onBackground }, selected: boolean) => {
  const backgroundColor = selected ? colors.primaryContainer : undefined;
  const onBackgroundColor = onBackground(backgroundColor);

  return {
    card: {
      ...(backgroundColor && { backgroundColor }),
    },
    onBackground: {
      color: onBackgroundColor,
    },
  };
});
