import { useTheme } from "react-native-paper";
import { StatusBar as BaseStatusBar } from 'expo-status-bar';

export const StatusBar = () => {
  const { colors } = useTheme();

  return <BaseStatusBar style="inverted" backgroundColor={colors.background} />;
};