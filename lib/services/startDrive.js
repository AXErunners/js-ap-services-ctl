const createMongoDb = require('./mongoDb/createMongoDb');
const startIPFS = require('./IPFS/startIPFS');
const startAxeCore = require('./axeCore/startAxeCore');
const createDriveApi = require('./driveApi/createDriveApi');
const createDriveSync = require('./driveSync/createDriveSync');

async function callInParallel(services, method) {
  const instances = [
    services.ipfs,
    services.axeCore,
    services.mongoDb,
    services.driveApi,
    services.driveSync,
  ];
  const promises = instances.map(instance => instance[method]());
  await Promise.all(promises);
}

/**
 * @typedef Drive
 * @property {IPFS} ipfs
 * @property {AxeCore} axeCore
 * @property {MongoDb} mongoDb
 * @property {DriveApi} driveApi
 * @property {DockerService} sync
 * @property {Promise<>} clean
 * @property {Promise<>} remove
 */

/**
 * Create Drive instance
 *
 * @param {object} [options]
 * @returns {Promise<Drive>}
 */
async function startDrive(options) {
  const instances = await startDrive.many(1, options);
  return instances[0];
}

/**
 * Create Drive instances
 *
 * @param {Number} number
 * @param {object} [options]
 * @returns {Promise<Drive[]>}
 */
startDrive.many = async function many(number, options = {}) {
  if (number < 1) {
    throw new Error('Invalid number of instances');
  }

  const instances = [];

  const ipfsAPIs = await startIPFS.many(number, options.ipfs);
  const axeCoreInstances = await startAxeCore.many(number, options.axeCore);

  for (let i = 0; i < number; i++) {
    const axeCoreInstance = axeCoreInstances[i];
    const ipfsAPI = ipfsAPIs[i];
    const mongoDbInstance = await createMongoDb(options.mongoDb);
    await mongoDbInstance.start();

    const envs = [
      `AXECORE_ZMQ_PUB_HASHBLOCK=${axeCoreInstance.getZmqSockets().hashblock}`,
      `AXECORE_JSON_RPC_HOST=${axeCoreInstance.getIp()}`,
      `AXECORE_JSON_RPC_PORT=${axeCoreInstance.options.getRpcPort()}`,
      `AXECORE_JSON_RPC_USER=${axeCoreInstance.options.getRpcUser()}`,
      `AXECORE_JSON_RPC_PASS=${axeCoreInstance.options.getRpcPassword()}`,
      `STORAGE_IPFS_MULTIADDR=${ipfsAPI.getIpfsAddress()}`,
      `STORAGE_MONGODB_URL=mongodb://${mongoDbInstance.getIp()}:27017`,
    ];
    const driveOptions = { ...options.drive };
    driveOptions.container = driveOptions.container || {};
    driveOptions.container.envs = envs;
    const driveApiInstance = await createDriveApi(driveOptions);
    await driveApiInstance.start();
    const driveSyncInstance = await createDriveSync(driveOptions);
    await driveSyncInstance.start();

    const instance = {
      ipfs: ipfsAPI,
      axeCore: axeCoreInstance,
      mongoDb: mongoDbInstance,
      driveApi: driveApiInstance,
      driveSync: driveSyncInstance,
      clean: async function clean() {
        await callInParallel(instance, 'clean');
      },
      remove: async function clean() {
        await callInParallel(instance, 'remove');
      },
      connect: async function connect(otherInstance) {
        await Promise.all([
          instance.ipfs.connect(otherInstance.ipfs),
          instance.axeCore.connect(otherInstance.axeCore),
          instance.mongoDb.connect(otherInstance.mongoDb),
          instance.driveApi.connect(otherInstance.driveApi),
          instance.driveSync.connect(otherInstance.driveSync),
        ]);
      },
    };

    instances.push(instance);
  }

  return instances;
};

module.exports = startDrive;
