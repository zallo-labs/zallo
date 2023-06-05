import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.scss';
import Head from '@docusaurus/Head';
import Screenshots from '@site/static/img/screenshots.png';
import AppstoreBadgeSvg from '@site/static/img/app-store-badge.svg';
import GooglePlayBadgePng from '@site/static/img/google-play-badge.png';
import ZkSyncSvg from '@site/static/img/zksync.svg';
import { useCustomFields } from '../hooks/useCustomFields';

const Homepage = () => {
  const customFields = useCustomFields();

  console.log(customFields);

  return (
    <main className={clsx('container', styles.container)}>
      <div className={clsx('row', styles.content)}>
        <div className="col col--8">
          <p className="display--medium">
            <b>Permission-based</b>
            <br />
            self-custodial <b>smart account</b>
          </p>

          <p className="title--large">Define the approvals required for different actions</p>

          <div className={styles.storeButtonsContainer}>
            <Link to={customFields.appStoreUrl} className={styles.storeButton}>
              <AppstoreBadgeSvg role="img" className={styles.storeButton} />
            </Link>

            <Link to={customFields.googlePlayUrl} className={styles.storeButton}>
              <img src={GooglePlayBadgePng} className={styles.storeButton} />
            </Link>
          </div>
        </div>

        <img src={Screenshots} alt="App" className={clsx('col col--4', styles.screenshots)} />
      </div>

      <div className={styles.zksyncContainer}>
        <ZkSyncSvg className={styles.zksync} />
      </div>
    </main>
  );
};

export default () => {
  return (
    <>
      <Head>
        <body className={styles.root} />
      </Head>

      <Layout description="Home" wrapperClassName={styles.root}>
        <Homepage />
      </Layout>
    </>
  );
};
