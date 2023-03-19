import { AccountId } from '@api/account';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

export interface SettingsScreenParams {
  account: AccountId;
}

export type SettingsScreenProps = StackNavigatorScreenProps<'Settings'>;

export const SettingsScreen = (props: SettingsScreenProps) => null;
