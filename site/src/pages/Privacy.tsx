import { useEffect } from 'react';

import { useCustomFields } from '../hooks/useCustomFields';

export default () => {
  const { privacyPolicyUrl } = useCustomFields();

  useEffect(() => {
    window.location.href = privacyPolicyUrl;
  }, [privacyPolicyUrl]);

  return null;
};
