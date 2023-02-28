import React, { FC, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import AuthRulesSvg from '@site/static/img/authorization-rules.svg';
import GithubSvg from '@site/static/img/github.svg';
import GraphQlSvg from '@site/static/img/graphql.svg';

interface FeatureItem {
  title: string;
  Image: FC<{ className: string }>;
  description: ReactNode;
}

const FeatureList: FeatureItem[] = [
  {
    title: 'Authorization rules',
    Image: (props) => <AuthRulesSvg role="img" {...props} />,
    description: (
      <>
        <p>Bring proportionality to security - allowing actions based on who approved it.</p>
        <p>Social recoverability, asset transfer limits, and much more.</p>
      </>
    ),
  },
  {
    title: 'GraphQL API',
    Image: (props) => <GraphQlSvg role="img" {...props} />,
    description: (
      <>
        <p>
          Interact programmatically, seamlessly integrated with our app for handling your
          authorization rules.
        </p>
        <p>Such as multi-user approvals of more sensitive tasks like contract upgrades.</p>
      </>
    ),
  },
  {
    title: 'Open source',
    Image: (props) => <GithubSvg role="img" {...props} />,
    description: (
      <>
        <p>Audited by the community and secured by cryptography, not obfuscation.</p>
        <p>Our AGPL-3.0 license gives the community control and keeps us value aligned.</p>
      </>
    ),
  },
];

export default () => (
  <section className={styles.features}>
    <div className="container">
      <div className="row">
        {FeatureList.map(({ title, Image, description }, i) => (
          <div key={i} className={clsx('col col--4', styles.feature)}>
            <Image className={styles.featureImage} />

            <div className="text--center padding-horiz--md">
              <h3 className="title--large">{title}</h3>
              <p>{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
