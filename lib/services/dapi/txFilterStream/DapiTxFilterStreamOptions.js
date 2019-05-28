const NodeJsServiceOptions = require('../../node/NodeJsServiceOptions');

class DapiTxFilterStreamOptions extends NodeJsServiceOptions {
  static setDefaultCustomOptions(options) {
    DapiTxFilterStreamOptions.defaultCustomOptions = options;
  }

  mergeWithDefaultOptions(...customOptions) {
    const defaultPorts = {
      port: this.getRandomPort(20002, 29998),
    };

    const defaultServiceOptions = {
      port: defaultPorts.port,
      cacheNodeModules: false,
      containerNodeModulesPath: '/node_modules',
      containerAppPath: '/usr/src/app',
    };

    customOptions[0].container.envs.push(`GRPC_SERVER_PORT=${defaultPorts.port}`);

    const defaultContainerOptions = {
      image: 'axerunners/dapi:latest',
      network: {
        name: 'axe_test_network',
        driver: 'bridge',
      },
      ports: [
        `${defaultPorts.port}:${defaultPorts.port}`,
      ],
      cmd: ['npm', 'run', 'tx-filter-stream'],
    };

    const defaultOptions = defaultServiceOptions;
    defaultOptions.container = defaultContainerOptions;

    return super.mergeWithDefaultOptions(
      defaultOptions,
      DapiTxFilterStreamOptions.defaultCustomOptions,
      ...customOptions,
    );
  }

  /**
     * Get dapi port
     *
     * @returns {number}
     */
  getRpcPort() {
    return this.options.port;
  }

  /**
     * @private
     *
     * @param {object} defaultPorts
     * @returns {Array}
     */
  // eslint-disable-next-line class-methods-use-this
  getPortsFrom(defaultPorts) {
    const ports = [];
    for (const [, port] of Object.entries(defaultPorts)) {
      ports.push(`${port}:${port}`);
    }
    return ports;
  }
}

DapiTxFilterStreamOptions.defaultCustomOptions = {};

module.exports = DapiTxFilterStreamOptions;
