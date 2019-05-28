const os = require('os');
const { merge } = require('loaxe');

const startMongoDb = require('./mongoDb/startMongoDb');
const startIPFS = require('./IPFS/startIPFS');
const startAxeCore = require('./axeCore/startAxeCore');
const startInsight = require('./insightApi/startInsightApi');
const createDriveApi = require('./driveApi/createDriveApi');
const createDriveSync = require('./driveSync/createDriveSync');
const createDapiCore = require('./dapi/core/createDapiCore');
const createDapiTxFilterStream = require('./dapi/txFilterStream/createDapiTxFilterStream');

async function remove(services) {
  const driveDeps = [
    services.mongoDb,
    services.ipfs,
    services.axeCore,
  ];

  const dapiDeps = [
    services.driveApi,
    services.driveSync,
    services.insightApi,
  ];

  const dapiProcesses = [
    services.dapiTxFilterStream,
    services.dapiCore,
  ];

  await Promise.all(dapiProcesses.map(instance => instance.remove()));
  await Promise.all(dapiDeps.map(instance => instance.remove()));
  await Promise.all(driveDeps.map(instance => instance.remove()));
}

/**
 * @typedef Dapi
 * @property {DapiCore} dapiCore
 * @property {DapiTxFilterStream} dapiTxFilterStream
 * @property {IPFS} ipfs
 * @property {AxeCore} axeCore
 * @property {MongoDb} mongoDb
 * @property {DriveApi} driveApi
 * @property {DriveSync} driveSync
 * @property {InsightApi} insightApi
 * @property {DockerService} sync
 * @property {Promise<void>} clean
 * @property {Promise<void>} remove
 */

/**
 * Create Dapi instance
 *
 * @param {object} [options]
 * @returns {Promise<Dapi>}
 */
async function startDapi(options) {
  const instances = await startDapi.many(1, options);
  return instances[0];
}

/**
 * Create Dapi instances
 *
 * @param {Number} number
 * @param {object} [options]
 * @returns {Promise<Dapi[]>}
 */
startDapi.many = async function many(number, options = {}) {
  if (number < 1) {
    throw new Error('Invalid number of instances');
  }
  if (number > 1) {
    throw new Error("We don't support more than 1 instance");
  }

  // Start Drive dependencies simultaneously

  const ipfsInstancesPromise = startIPFS.many(number, options.ipfs);
  const axeCoreInstancesPromise = startAxeCore.many(number, options.axeCore);
  const mongoDbInstancesPromise = startMongoDb.many(number, options.mongoDb);

  const [ipfsInstances, axeCoreInstances, mongoDbInstances] = await Promise.all([
    ipfsInstancesPromise,
    axeCoreInstancesPromise,
    mongoDbInstancesPromise,
  ]);

  const instances = [];

  for (let i = 0; i < number; i++) {
    // Start Drive processes and Insight API simultaneously

    const axeCore = axeCoreInstances[i];
    const ipfs = ipfsInstances[i];
    const mongoDb = mongoDbInstances[i];

    const driveEnvs = [
      `AXECORE_ZMQ_PUB_HASHBLOCK=${axeCore.getZmqSockets().hashblock}`,
      `AXECORE_JSON_RPC_HOST=${axeCore.getIp()}`,
      `AXECORE_JSON_RPC_PORT=${axeCore.options.getRpcPort()}`,
      `AXECORE_JSON_RPC_USER=${axeCore.options.getRpcUser()}`,
      `AXECORE_JSON_RPC_PASS=${axeCore.options.getRpcPassword()}`,
      `STORAGE_IPFS_MULTIADDR=${ipfs.getIpfsAddress()}`,
      `STORAGE_MONGODB_URL=mongodb://${mongoDb.getIp()}:27017`,
    ];

    const driveOptions = { ...options.drive };
    driveOptions.container = driveOptions.container || {};
    driveOptions.container.envs = driveEnvs;

    const driveApi = await createDriveApi(driveOptions);
    const driveApiPromise = driveApi.start();

    const driveSync = await createDriveSync(driveOptions);
    const driveSyncPromise = driveSync.start();

    const insightOptions = {
      container: {},
      config: {},
      ...options.insightApi,
    };

    merge(insightOptions.config, {
      servicesConfig: {
        axed: {
          connect: [{
            rpchost: `${axeCore.getIp()}`,
            rpcport: `${axeCore.options.getRpcPort()}`,
            rpcuser: `${axeCore.options.getRpcUser()}`,
            rpcpassword: `${axeCore.options.getRpcPassword()}`,
            zmqpubrawtx: `tcp://host.docker.internal:${axeCore.options.getZmqPorts().rawtx}`,
            zmqpubhashblock: `tcp://host.docker.internal:${axeCore.options.getZmqPorts().hashblock}`,
          }],
        },
      },
    });

    const insightApiPromise = await startInsight(insightOptions);

    const [,, insightApi] = await Promise.all([
      driveApiPromise,
      driveSyncPromise,
      insightApiPromise,
    ]);

    // Start DAPI processes

    const dapiEnvs = [
      `INSIGHT_URI=http://${insightApi.getIp()}:${insightApi.options.getApiPort()}/insight-api`,
      `AXECORE_RPC_HOST=${axeCore.getIp()}`,
      `AXECORE_RPC_PORT=${axeCore.options.getRpcPort()}`,
      `AXECORE_RPC_USER=${axeCore.options.getRpcUser()}`,
      `AXECORE_RPC_PASS=${axeCore.options.getRpcPassword()}`,
      `AXECORE_ZMQ_HOST=${axeCore.getIp()}`,
      `AXECORE_ZMQ_PORT=${axeCore.options.getZmqPorts().rawtxlock}`,
      `AXECORE_P2P_HOST=${axeCore.getIp()}`,
      `AXECORE_P2P_PORT=${axeCore.options.getAxedPort()}`,
      `DRIVE_RPC_PORT=${driveApi.options.getRpcPort()}`,
      'AXECORE_P2P_NETWORK=regtest',
      'NETWORK=regtest',
    ];

    if (os.platform() === 'darwin') {
      dapiEnvs.push('DRIVE_RPC_HOST=docker.for.mac.localhost');
    } else {
      dapiEnvs.push(`DRIVE_RPC_HOST=${driveApi.getIp()}`);
    }

    const dapiOptions = { ...options.dapi };
    dapiOptions.container = dapiOptions.container || {};
    dapiOptions.container.envs = dapiEnvs;

    const dapiCore = await createDapiCore(dapiOptions);
    const dapiCorePromise = dapiCore.start();

    const dapiTxFilterStream = await createDapiTxFilterStream(dapiOptions);
    const dapiTxFilterStreamPromise = dapiTxFilterStream.start();

    await Promise.all([
      dapiCorePromise,
      dapiTxFilterStreamPromise,
    ]);

    const instance = {
      dapiCore,
      dapiTxFilterStream,
      insightApi,
      driveApi,
      driveSync,
      ipfs,
      mongoDb,
      axeCore,
      async clean() {
        await remove(instance);

        const newServices = await startDapi(options);

        Object.assign(instance, newServices);
      },
      async remove() {
        await remove(instance);
      },
    };

    instances.push(instance);
  }

  return instances;
};

module.exports = startDapi;
