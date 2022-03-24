import constants from 'expo-constants';
import type { Config } from 'lib/config';

export const CONFIG = constants.manifest?.extra as Config;
