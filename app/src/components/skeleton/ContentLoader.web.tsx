import React from 'react';

/*
 * react-content-loader issue - https://github.com/danilowoz/react-content-loader/issues/261
 * React-native-web fix - https://github.com/necolas/react-native-web/pull/2569
 */

export { default as ContentLoader, IContentLoaderProps } from 'react-content-loader';

export function Rect(props: React.SVGProps<SVGRectElement>) {
  return <rect {...props} />;
}

export function Circle(props: React.SVGProps<SVGCircleElement>) {
  return <circle {...props} />;
}
