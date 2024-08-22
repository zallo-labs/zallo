import { Redirect } from 'expo-router';
import { CONFIG } from '~/util/config';

export const TERMS_OF_SERVICE_HREF = `${CONFIG.docsUrl}/terms-of-service` as const;

export default function TermsOfServiceScreen() {
  return <Redirect href={TERMS_OF_SERVICE_HREF} />;
}
