import { QrCodeIcon } from '@theme/icons';
import { useEffect } from 'react';
import { showSuccess } from '#/provider/SnackbarProvider';
import { LINKINGS_FROM_TOKEN } from '~/app/(modal)/link';
import { Link } from 'expo-router';
import { Button } from '../Button';

export interface LinkZalloButtonProps {
  onLink?: () => void;
}

export function LinkZalloButton({ onLink }: LinkZalloButtonProps) {
  useEffect(() => {
    const sub = LINKINGS_FROM_TOKEN.subscribe(() => {
      showSuccess('Linked');
      onLink?.();
    });

    return () => sub.unsubscribe();
  }, [onLink]);

  return (
    <Link href="/link" asChild>
      <Button mode="contained-tonal" icon={QrCodeIcon}>
        Continue with Zallo
      </Button>
    </Link>
  );
}
