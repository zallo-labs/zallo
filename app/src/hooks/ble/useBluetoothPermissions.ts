export interface BluetoothPermissionsOptions {
  request?: boolean;
}

export default function useBluetoothPermissions(
  _options?: BluetoothPermissionsOptions,
): [boolean, () => void] {
  return [true, () => {}];
}
