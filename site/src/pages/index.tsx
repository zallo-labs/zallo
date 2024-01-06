import React from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import AppstoreBadgeSvg from '@site/static/img/app-store-badge.svg';
import GooglePlayBadgePng from '@site/static/img/google-play-badge.png';
import Screenshots from '@site/static/img/screenshots.png';
import ZkSyncSvg from '@site/static/img/zksync.svg';
import clsx from 'clsx';

import Layout from '~/util/theme/Layout';
import { useCustomFields } from '../hooks/useCustomFields';
import styles from './index.module.scss';

const Homepage = () => {
  const customFields = useCustomFields();

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
