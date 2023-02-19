import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface CustomFields {
  apolloGraphRef: string;
  apiUrl: string;
  signUpUrl: string;
}

export const useCustomFields = () =>
  useDocusaurusContext().siteConfig.customFields as unknown as CustomFields;
