const RpcClient = require('@axerunners/axed-rpc/promise');

const AxeCoreOptions = require('./AxeCoreOptions');
const Network = require('../../docker/Network');
const getAwsEcrAuthorizationToken = require('../../docker/getAwsEcrAuthorizationToken');
const Image = require('../../docker/Image');
const Container = require('../../docker/Container');
const AxeCore = require('./AxeCore');

/**
 * Create Axe Core instance
 *
 * @param {object} [opts]
 * @returns {Promise<AxeCore>}
 */
async function createAxeCore(opts) {
  const options = opts instanceof AxeCoreOptions
    ? opts
    : new AxeCoreOptions(opts);

  const { name: networkName, driver } = options.getContainerNetworkOptions();
  const network = new Network(networkName, driver);

  const imageName = options.getContainerImageName();

  let authorizationToken;
  if (imageName.includes('amazonaws.com')) {
    authorizationToken = await getAwsEcrAuthorizationToken(options.getAwsOptions());
  }

  const image = new Image(imageName, authorizationToken);

  const containerOptions = options.getContainerOptions();
  const container = new Container(networkName, imageName, containerOptions);

  return new AxeCore(network, image, container, RpcClient, options);
}

module.exports = createAxeCore;
