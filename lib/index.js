const createAxeCore = require('./services/axeCore/createAxeCore');
const startAxeCore = require('./services/axeCore/startAxeCore');

const createInsightApi = require('./services/insightApi/createInsightApi');
const startInsightApi = require('./services/insightApi/startInsightApi');

const startDapi = require('./services/startDapi');
const createDapiCore = require('./services/dapi/core/createDapiCore');
const createDapiTxFilterStream = require('./services/dapi/txFilterStream/createDapiTxFilterStream');

const createDriveApi = require('./services/driveApi/createDriveApi');
const createDriveSync = require('./services/driveSync/createDriveSync');
const startDrive = require('./services/startDrive');

const createIPFS = require('./services/IPFS/createIPFS');
const startIPFS = require('./services/IPFS/startIPFS');

const createMongoDb = require('./services/mongoDb/createMongoDb');
const startMongoDb = require('./services/mongoDb/startMongoDb');

const mocha = require('./mocha');

module.exports = {
  createAxeCore,
  startAxeCore,
  createInsightApi,
  startInsightApi,
  createDapiCore,
  createDapiTxFilterStream,
  startDapi,
  createDriveApi,
  createDriveSync,
  startDrive,
  createIPFS,
  startIPFS,
  createMongoDb,
  startMongoDb,
  mocha,
};
