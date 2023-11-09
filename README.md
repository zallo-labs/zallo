<div align="center" style="margin-bottom: 24px;">
  <img src="./app/assets/logo.svg" alt="logo">
  <p>Self-custody without compromise</p>
</div>

<p align="center">
    <a href="https://zallo.io" alt="App status">
        <img src="https://img.shields.io/uptimerobot/status/m794240179-564e47542a1d69cfb2b761b2?label=App" /></a>
    <a href="https://api.zallo.io/graphql" alt="API status">
        <img src="https://img.shields.io/uptimerobot/status/m794240173-106d1745a3a017c914cc723c?label=API" /></a>
    <a href="https://github.com/zallo-labs/zallo/actions/workflows/deployment.yaml?branch=main" alt="Deployment">
        <img src="https://github.com/zallo-labs/zallo/actions/workflows/deployment.yaml/badge.svg?branch=main" /></a>
</p>
<p align="center">
    <a href="https://www.gnu.org/licenses/agpl-3." alt="License">
        <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" /></a>
    <a href="https://github.com/badges/shields/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/zallo-labs/zallo" /></a>
    <a href="https://twitter.com/intent/follow?screen_name=ZalloWallet" alt="Follow on X">
        <img src="https://img.shields.io/twitter/follow/ZalloWallet"></a>
</p>

## Setup

- See `.env.template` for required configuration

```bash
yarn
```

## API

```bash
# Build
yarn api build

# Test
yarn api test

# Run
yarn api start
```

## App

```bash
# Build
yarn app build

# Test
yarn app test

# Run
yarn app start
```

## Contracts

```bash
# Build
yarn contracts build

# Test
yarn contracts test
```
