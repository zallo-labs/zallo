import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { UAParser } from 'ua-parser-js';

export function getDeviceModel() {
  return Platform.select({
    web: () => [Device.osName, new UAParser().getBrowser().name || 'Web'].filter(Boolean).join('/'), // Linux/Chrome
    default: () => {
      const model = /.*?(iPhone|Pixel|Galaxy|Macbook|iMac).*/.exec(Device.modelName ?? '')?.[1];
      return model || Platform.OS.slice(0, 1).toUpperCase() + Platform.OS.slice(1);
    },
  })();
}
