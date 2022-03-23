#!/bin/sh

rm -rf /tmp/haste-map-*
rm -rf /tmp/metro-*

rm -rf ../**/node_modules
yarn cache clean
yarn

#DEBUG="*" EXPO_DEBUG=1 yarn start --clear

