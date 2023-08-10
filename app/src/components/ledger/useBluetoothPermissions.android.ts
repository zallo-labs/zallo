import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import useAsyncEffect from 'use-async-effect';
import type useBluetoothPermission_DEFAULT from './useBluetoothPermissions';
import { BluetoothPermissionsOptions } from './useBluetoothPermissions';

const API_LEVEL =
  typeof Platform.Version === 'number' ? Platform.Version : parseFloat(Platform.Version);

// https://developer.android.com/guide/topics/connectivity/bluetooth/permissions
const REQUIRED_PERMISSIONS =
  API_LEVEL >= 31
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        // ACCESS_FINE_LOCATION *shouldn't* be required, but is due to a AndroidManifest bug in @config-plugins/react-native-ble-plx https://github.com/expo/config-plugins/pull/91
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]
    : [
        // <= 30
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // Location is never used but "is necessary because, on Android 11 and lower, a Bluetooth scan could potentially be used to gather information about the location of the user."
      ];

const useBluetoothPermissions: typeof useBluetoothPermission_DEFAULT = ({
  request,
}: BluetoothPermissionsOptions = {}) => {
  const [granted, setGranted] = useState(false);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const requestPermissions = useCallback(async () => {
    Platform.OS;

    const results = await PermissionsAndroid.requestMultiple(REQUIRED_PERMISSIONS);
    if (mounted.current) setGranted(Object.values(results).every((r) => r === 'granted'));
  }, []);

  useAsyncEffect(async (isMounted) => {
    if (request) {
      requestPermissions();
    } else {
      const results = await Promise.all(REQUIRED_PERMISSIONS.map(PermissionsAndroid.check));
      if (isMounted()) setGranted(results.every(Boolean));
    }
  }, []);

  return [granted, requestPermissions];
};

export default useBluetoothPermissions;
