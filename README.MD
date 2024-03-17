# Сервис Virtual Wallet Manager

Реализация микросервиса для управления пользовательскими виртуальными
кошельками.

## Release Branch (Stable)
[![pipeline status](https://gitlab.com/workstore/virtual-wallet-manager/badges/release/pipeline.svg)](https://gitlab.com/workstore/virtual-wallet-manager/-/commits/master)
[![coverage report](https://gitlab.com/workstore/virtual-wallet-manager/badges/release/coverage.svg)](https://gitlab.com/workstore/virtual-wallet-manager/-/commits/master)
#### Links
- [Openapi Reference](https://workstore.gitlab.io/virtual-wallet-manager/release/openapi/)
- [API Reference](https://workstore.gitlab.io/virtual-wallet-manager/release/docs/)
- [Coverage Report](https://workstore.gitlab.io/virtual-wallet-manager/release/coverage)

## Master Branch (Current unstable)
[![pipeline status](https://gitlab.com/workstore/virtual-wallet-manager/badges/master/pipeline.svg)](https://gitlab.com/workstore/virtual-wallet-manager/-/commits/master)
[![coverage report](https://gitlab.com/workstore/virtual-wallet-manager/badges/master/coverage.svg)](https://gitlab.com/workstore/virtual-wallet-manager/-/commits/master)
#### Links
- [Openapi Reference](https://workstore.gitlab.io/virtual-wallet-manager/master/openapi/)
- [API Reference](https://workstore.gitlab.io/virtual-wallet-manager/master/docs/)
- [Coverage Report](https://workstore.gitlab.io/virtual-wallet-manager/master/coverage)

## Installation

```bash
$ cat example.environment > .env # then you can edit .env file
$ docker-compose up #for development
```

## Running the app (Without Docker, you don't need this command while using Docker containers)

```bash
$ npm install @nestjs/cli

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# all tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Lint

```bash
# lint
$ npm run lint

# lint + fix
$ npm run lint:fix
```

## Migrations
### You must use migrations only outside docker container
#### Либо же прописать TYPEORM_HOST_LOCAL равным TYPEORM_HOST у себя в .env

```bash
# create-transfer
$ npm run cli migration generate <name>

# show migrations statuses
$ npm run cli migration show

# run all migrations that has not been already executed (all new migrations)
$ npm run cli migration run

# revert last migration
$ npm run cli migration revert
```

See other helpful commands in **package.json**

# License

SEE LICENSE.MD

### **_All rights reserved_**
