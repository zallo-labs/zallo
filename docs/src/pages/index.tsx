import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.scss';
import Head from '@docusaurus/Head';
import AppImage from '@site/static/img/app.png';

const HomepageHeader = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('container', styles.heroBanner)}>
      <div className={clsx('row', styles.headerRow)}>
        <div className="col col--8">
          <h1 className="display--small">{siteConfig.tagline}</h1>
          <p className="title--large">Secure your zkSync account without compromises</p>

          <Link className="button button--lg" to="/docs/getting-started">
            Developers - 5 min
          </Link>
        </div>

        <div className="col col--4">
          <img src={AppImage} alt="App" className={styles.app} />
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
