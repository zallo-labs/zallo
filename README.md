# Zallo

<p align="center">
    <a href="https://www.gnu.org/licenses/agpl-3." alt="License">
        <img src="https://img.shields.io/badge/License-AGPL%20v3-blue.svg" /></a>
    <a href="https://api.zallo.io/health" alt="Uptime">
        <img src="https://img.shields.io/uptimerobot/ratio/m793729856-fc349467b2ead72b2b917ed2" /></a>
    <a href="https://github.com/zallo-labs/zallo/actions/workflows/deployment.yaml?branch=main" alt="Deployment">
        <img src="https://github.com/zallo-labs/zallo/actions/workflows/deployment.yaml/badge.svg?branch=main" /></a>
    <a href="https://zallo.io" alt="Site">
        <img src="https://img.shields.io/netlify/f3543118-0495-4215-af87-4c77b5c55763?label=Site" /></a>
    <a href="https://github.com/badges/shields/pulse" alt="Activity">
        <img src="https://img.shields.io/github/commit-activity/m/zallo-labs/zallo" /></a>
    <a href="https://twitter.com/intent/follow?screen_name=ZalloLabs" alt="Follow on Twitter">
        <img src="https://img.shields.io/twitter/follow/ZalloLabs"></a>
</p>

A self-custodial smart wallet

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
