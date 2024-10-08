import { Redirect } from 'expo-router';
import { CONFIG } from '~/util/config';

export const PRIVACY_POLICY_HREF = `${CONFIG.docsUrl}/privacy` as const;

export default function PrivacyPolicyScreen() {
  return <Redirect href={PRIVACY_POLICY_HREF} />;
}
