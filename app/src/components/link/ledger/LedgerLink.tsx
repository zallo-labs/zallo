import { Link } from 'expo-router';
import { Platform } from 'react-native';

export interface LedgerLinkProps {
  children: React.ReactNode;
}

export function LedgerLink({ children }: LedgerLinkProps) {
  if (Platform.OS === 'web') return null;

  return (
    <Link href="/ledger/link" asChild>
      {children}
    </Link>
  );
}
