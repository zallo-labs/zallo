import { View, ViewProps } from 'react-native';
import { SafeAreaView as Base } from 'react-native-safe-area-context';

export interface SafeAreaViewProps extends ViewProps {
  enabled: boolean;
}

export const SafeAreaView = ({ enabled, ...props }: SafeAreaViewProps) =>
  enabled ? <Base {...props} /> : <View {...props} />;
