import { Platform } from 'react-native';
import * as Device from 'expo-device';

export function getDeviceModel() {
  const model = /.*?(iPhone|Pixel|Galaxy|Macbook|iMac).*/.exec(Device.modelName ?? '')?.[1];

  return Platform.select({
    ios: model,
    android: model,
    macos: model ?? 'Mac',
    windows: model ?? 'Windows',
    web: 'Web',
  });
}
