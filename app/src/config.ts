import constants from 'expo-constants';
import type { Config } from '../app.config';

export const CONFIG = constants.manifest?.extra as Config;

export const IS_DEV = CONFIG.env === 'development';
