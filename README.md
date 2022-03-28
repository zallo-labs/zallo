# metasafe

## Setup
```bash
yarn install
```

## API
### Local
```bash
docker build -t metasafe-api .
docker run --rm metasafe-api:latest
```

### Hosted
#### Configuration
1. [Install Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
   
2. Login
```bash
heroku login
heroku container:login
```

1. Configure app
```bash
heroku create metasafe-api --manifest --remote heroku-api
heroku stack:set container -a metasafe-api
heroku addons:create heroku-postgresql -a metasafe-api --name metasafe-api-database --as DATABASE
heroku addons:create heroku-postgresql -a metasafe-api --name metasafe-api-shadow-database --as SHADOW_DATABASE
```

#### Deployment
1. Push to Heroku
```bash
heroku container:push web -a metasafe-api
```

2. Deploy
```bash
heroku container:release web -a metasafe-api
```


## App
```bash
yarn app build
yarn app start
```

## Contracts
### Build
```bash
yarn contracts build
```

### Test
```bash
yarn contracts test
```
