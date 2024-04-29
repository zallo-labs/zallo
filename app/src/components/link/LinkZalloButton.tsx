import { QrCodeIcon } from '@theme/icons';
import { Link } from 'expo-router';
import { Button, ButtonProps } from '../Button';

export interface LinkZalloButton extends Partial<ButtonProps> {}

export function LinkZalloButton(props: LinkZalloButton) {
  return (
    <Link href="/link" asChild>
      <Button mode="contained-tonal" icon={QrCodeIcon} {...props}>
        Continue with Zallo
      </Button>
    </Link>
  );
}
