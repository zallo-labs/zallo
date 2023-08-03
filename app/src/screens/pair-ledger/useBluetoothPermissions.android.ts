import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { clog } from '~/util/format';
import useAsyncEffect from 'use-async-effect';
import type useBluetoothPermission_DEFAULT from './useBluetoothPermissions';
import { BluetoothPermissionsOptions } from './useBluetoothPermissions';

const API_LEVEL =
  typeof Platform.Version === 'number' ? Platform.Version : parseFloat(Platform.Version);

const REQUIRED_PERMISSIONS =
  API_LEVEL >= 31
    ? [
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]
    : [
        // TODO: check these
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
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
    clog({ results });
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
