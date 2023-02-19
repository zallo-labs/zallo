import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.scss';
import Head from '@docusaurus/Head';
import AppImage from '@site/static/img/app.png';
import AppstoreBadgeSvg from '@site/static/img/app-store-preorder-badge.svg';
import GooglePlayBadgePng from '@site/static/img/google-play-badge.png';
import { useCustomFields } from '../hooks/useCustomFields';

const HomepageHeader = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('container', styles.heroBanner)}>
      <div className={clsx('row', styles.headerRow)}>
        <div className="col col--8">
          <h1 className="display--small">{siteConfig.tagline}</h1>
          <p className="title--large">Secure your zkSync account without compromises</p>

          <Link className="button button--lg" to={useCustomFields().signUpUrl}>
            Sign up to Early Access
          </Link>

          {/* <div className={styles.developersContainer}>
            <h6 className={clsx('label--large', styles.developersLabel)}>Developers</h6>

            <Link className="button button--lg" to="/docs/getting-started">
              Get started
            </Link>
          </div>

          <div className={styles.storeButtonsContainer}>
            <AppstoreBadgeSvg
              role="img"
              className={styles.storeButton}
              onClick={() => alert('Coming soon')}
            />

            <img
              src={GooglePlayBadgePng}
              className={styles.storeButton}
              onClick={() => alert('Coming soon')}
            />
          </div> */}
        </div>

        <div className="col col--4">
          <img src={AppImage} alt="App" className={styles.appImage} />
        </div>
      </div>
    </header>
  );
};

export default () => {
  return (
    <>
      <Head>
        <body className={styles.homepage} />
      </Head>

      <Layout description="Home">
        <HomepageHeader />

        <main>
          <HomepageFeatures />
        </main>
      </Layout>
    </>
  );
};
