import { Address } from "lib";
import { useAccount } from "~/queries/account/useAccount.api";

export interface AccountItemProps {
  id: Address;
  onPress: () => void;
}

export const AccountItem = ({ id }: AccountItemProps) => {
  const [account] = useAccount(id);

  // TODO: implement
  return null;
};
