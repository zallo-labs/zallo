import { DeployIcon } from '@theme/icons';
import { FC } from 'react';
import { useActivateAccount } from '~/mutations/account/useActivateAccount';
import { CombinedAccount } from '~/queries/account';
import { FABProps } from '../FAB';

type RequiredProps = Pick<FABProps, 'icon' | 'label' | 'loading' | 'onPress'>;

export interface ActivateAccountButtonProps {
  children: FC<RequiredProps>;
  account: CombinedAccount;
}

export const ActivateAccountButton = ({
  children: Button,
  account,
}: ActivateAccountButtonProps) => {
  const [activate, activating] = useActivateAccount(account);

  if (!activate) return null;

  return (
    <Button
      icon={DeployIcon}
      label="Activate"
      loading={activating}
      onPress={activate}
    />
  );
};
