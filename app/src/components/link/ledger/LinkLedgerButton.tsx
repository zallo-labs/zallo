import { useEffect } from 'react';
import { Link } from 'expo-router';
import { LINKINGS_FROM_DEVICE } from '~/app/(sheet)/link/token';
import { LedgerIcon } from '@theme/icons';
import { Button } from '#/Button';
import { Platform } from 'react-native';

export interface LinkLedgerButtonProps {
  onLink?: () => void;
}

export function LinkLedgerButton({ onLink }: LinkLedgerButtonProps) {
  useEffect(() => {
    const sub = LINKINGS_FROM_DEVICE.subscribe({ next: () => onLink?.() });
    return () => {
      if (!sub.closed) sub.unsubscribe();
    };
  }, [onLink]);

  if (Platform.OS === 'web') return null;

  return (
    <Link href="/ledger/link" asChild>
      <Button mode="contained-tonal" icon={(props) => <LedgerIcon {...props} />}>
        Continue with Ledger
      </Button>
    </Link>
  );
}
