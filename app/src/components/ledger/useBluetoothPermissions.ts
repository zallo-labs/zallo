export interface BluetoothPermissionsOptions {
  request?: boolean;
}

export default function useBluetoothPermissions(
  _options?: BluetoothPermissionsOptions,
): [boolean, () => void] {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return [true, () => {}];
}
