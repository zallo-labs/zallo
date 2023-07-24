import 'expo/build/Expo.fx';
import './src/util/patches';

import { registerRootComponent } from 'expo';
import { activateKeepAwakeAsync } from 'expo-keep-awake';
import App from './src/App';

if (__DEV__) {
  activateKeepAwakeAsync();
}

registerRootComponent(App);
