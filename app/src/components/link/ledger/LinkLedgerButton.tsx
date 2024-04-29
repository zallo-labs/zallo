import { Link } from 'expo-router';
import { LedgerIcon } from '@theme/icons';
import { Button } from '#/Button';
import { Platform } from 'react-native';

export function LinkLedgerButton() {
  if (Platform.OS === 'web') return null;

  return (
    <Link href="/ledger/link" asChild>
      <Button mode="contained-tonal" icon={(props) => <LedgerIcon {...props} />}>
        Continue with Ledger
      </Button>
    </Link>
  );
}
