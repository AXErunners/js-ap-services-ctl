# Axe Platform services ctl

[![Build Status](https://travis-ci.com/axerunners/js-ap-services-ctl.svg?branch=master)](https://travis-ci.com/axerunners/js-ap-services-ctl)
[![NPM version](https://img.shields.io/npm/v/@axerunners/ap-services-ctl.svg)](https://npmjs.org/package/@axerunners/ap-services-ctl)

> Control Axe Platform services using JavaScript and Docker

The tool provides a convenient JavaScript interface for configuration and interaction with Axe Platform services. Services are started in Docker containers.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Available AP services](#available-ap-services)
    - [Services configuration](#services-configuration)
    - [Integration with Mocha](#integration-with-mocha)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. [Install Docker](https://docs.docker.com/install/)
2. Install NPM package:

    ```sh
    npm install @axerunners/ap-services-ctl
    ```

## Usage

### Available AP services

#### Drive

[Drive](https://github.com/axerunners/drive) service starts a bunch of related services:
- Drive Api
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/driveApi/DriveApi.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/driveApi/DriveApiOptions.js)
- Drive Sync
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/driveSync/DriveSync.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/driveSync/DriveSyncOptions.js)
- [IPFS](#ipfs)
- [MongoDB](#mongodb)
- [Axe Core](#axe-core)

#### DAPI

[DAPI](https://github.com/axerunners/dapi) service starts all AP services:
- DAPI Core
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/dapi/core/DapiCore.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/dapi/core/DapiCoreOptions.js)
- DAPI TxFilterStream
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/dapi/txFilterStream/DapiTxFilterStream.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/dapi/txFilterStream/DapiTxFilterStreamOptions.js)
- [Drive Api](#drive)
- [Drive Sync](#drive)
- [IPFS](#ipfs)
- [MongoDB](#mongodb)
- [AxeCore](#axe-core)
- [Insight](#insight)

#### Axe Core

[Axe Core](https://github.com/axerunners/axe) service
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/axeCore/AxeCore.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/axeCore/AxeCoreOptions.js)

#### Insight API

- [Insight API](https://github.com/axerunners/insight-api) service
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/insightApi/InsightApi.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/insightApi/InsightApiOptions.js)

#### IPFS

- [IPFS](https://github.com/ipfs/go-ipfs) service
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/IPFS/IPFS.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/IPFS/IPFSOptions.js)

#### MongoDB

- [MongoDB](https://www.mongodb.com/) service
    - [Methods](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/mongoDb/MongoDb.js)
    - [Options](https://github.com/axerunners/js-ap-services-ctl/blob/master/lib/services/mongoDb/MongoDbOptions.js)

### Starting a service

```js
// Export service(s)
const { startIPFS } = require('@axerunners/ap-services-ctl');

// This is optional. Default options listed in options class
const options = {
  port: 5001, // IPFS port
};

// Start service
const ipfs = await startIPFS(options);

// Get peer ID
const peerId = await ipfs.getApi().id();

// Stop IPFS
await ipfs.remove();
```

Use `many` method to start several instances:

```js
const { startIPFS } = require('@axerunners/ap-services-ctl');

// This is optional. Default options listed in options class
const options = {
  port: 5001, // IPFS port
};

// Start two services
const ipfsNodes = await startIPFS.many(2, options);

// Get peer IDs
const [peerId1, peerId2] = await Promise.all(
  ipfsNodes.map(ipfs => ipfs.getApi().id()),
);

// Stop IPFS nodes
await Promise.all(
  ipfsNodes.map(ipfs => ipfs.remove()),
);
```

### Services configuration

Each service has default options which can be overwritten in three ways:
1. Pass options as plain JS object to `start[service]` or `create[service]` methods
2. Pass instance of options class to `start[service]` or `create[service]` methods
3. Pass default options as plain JS object to `setDefaultCustomOptions` method of options class

### Integration with Mocha

Services [Mocha](https://mochajs.org/) hooks provide automation for your mocha tests:
- Removing obsolete related Docker containers (`before`)
- Cleaning a service state between tests (`beforeEach`, `afterEach`)
- Stopping service after tests (`after`)

```js
// Export service(s) with mocha hooks
const { mocha: { startIPFS } } = require('@axerunners/ap-services-ctl');

describe('Test suite', () => {
  let ipfsApi;

  startIPFS().then(ipfs => () => {
    ipfsApi = ipfs.getApi();
  });

  it('should do something', async () => {
    const peerId = await ipfsApi.id();

    expect(peerId).to.be.a('string');
  });
});
```

## Maintainers

[@shumkov](https://github.com/shumkov)

[@jawid-h](https://github.com/jawid-h)

[@abvgedeika](https://github.com/abvgedeika)

## Contributing

Feel free to dive in! [Open an issue](https://github.com/axerunners/js-ap-services-ctl/issues/new) or submit PRs.

## License

[MIT](LICENSE) &copy; Axe Core Group, Inc.
