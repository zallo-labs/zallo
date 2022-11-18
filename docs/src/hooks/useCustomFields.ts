import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export interface CustomFields {
  apolloGraphRef: string;
  feedbackEmail: string;
  supportEmail: string;
}

export const useCustomFields = () =>
  useDocusaurusContext().siteConfig.customFields as unknown as CustomFields;
