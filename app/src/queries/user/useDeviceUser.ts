import { useDevice } from "@network/useDevice";
import { Address } from "lib";

export const useDeviceUser = (account: Address) => {
  const device = useDevice();
}