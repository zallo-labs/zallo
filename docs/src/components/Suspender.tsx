import React from 'react';

export const SUSPEND_PROMISE = new Promise((_resolve) => {
  //
});

export const Suspend = React.lazy(
  () =>
    new Promise((_resolve) => {
      //
    }),
);
