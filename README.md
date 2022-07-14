# metasafe

## Setup

```bash
yarn
```

## API

### Local

```bash
# Build
yarn api build

# Test
yarn api test

# Run
yarn api start
```

#### Docker

```bash
# Build image
DOCKER_BUILDKIT=1 docker build -t metasafe-api --build-arg SUBGRAPH_GQL_URL=$SUBGRAPH_GQL_URL .

# Run container
docker run --rm metasafe-api
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
