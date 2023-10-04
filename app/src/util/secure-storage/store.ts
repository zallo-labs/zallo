import AsyncStorage from '@react-native-async-storage/async-storage';
import { GetSecureStore } from './types';

// TODO: encrypt data with user password - https://linear.app/zallo/issue/Z-195/password-security
export const getSecureStore: GetSecureStore = (options) => ({
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
});
