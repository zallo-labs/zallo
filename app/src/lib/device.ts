import { Platform } from 'react-native';
import * as Device from 'expo-device';

const model = /.*?(iPhone|Pixel|Galaxy|Macbook|iMac).*/.exec(Device.modelName ?? '')?.[1];

export const DEVICE_MODEL = Platform.select({
  ios: model,
  android: model,
  macos: model ?? 'Mac',
  windows: model ?? 'Windows',
  web: 'Web',
});
