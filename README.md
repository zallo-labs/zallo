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

### Hosted

#### Setup

```bash
# Login
heroku login
heroku container:login

# Configure
heroku create metasafe-api --manifest --remote heroku-api
heroku stack:set container -a metasafe-api
heroku addons:create heroku-postgresql -a metasafe-api --name metasafe-api-database --as DATABASE
heroku addons:create heroku-postgresql -a metasafe-api --name metasafe-api-shadow-database --as SHADOW_DATABASE
```

#### Manual Deployment

```bash
heroku container:push web -a metasafe-api
heroku container:release web -a metasafe-api
```

#### Logs

```bash
heroku logs --tail -a metasafe-api
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
