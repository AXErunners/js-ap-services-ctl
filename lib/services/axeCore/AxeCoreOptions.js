const DockerServiceOptions = require('../../docker/DockerServiceOptions');

class AxeCoreOptions extends DockerServiceOptions {
  static setDefaultCustomOptions(options) {
    AxeCoreOptions.defaultCustomOptions = options;
  }

  mergeWithDefaultOptions(...customOptions) {
    const defaultPorts = {
      port: this.getRandomPort(20002, 29998),
      rpcport: this.getRandomPort(20002, 29998),
      zmqport: this.getRandomPort(40002, 40998),
    };

    const defaultServiceOptions = {
      port: defaultPorts.port,
      rpcuser: 'axerpc',
      rpcpassword: 'password',
      rpcport: defaultPorts.rpcport,
      zmqpubrawtx: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
      zmqpubrawtxlock: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
      zmqpubhashblock: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
      zmqpubhashtx: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
      zmqpubhashtxlock: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
      zmqpubrawblock: `tcp://0.0.0.0:${defaultPorts.zmqport}`,
    };

    const defaultContainerOptions = {
      image: 'axerunners/axed:evo-latest',
      network: {
        name: 'axe_test_network',
        driver: 'bridge',
      },
      ports: this.getPortsFrom(defaultPorts),
      cmd: [
        'axed',
        `-port=${defaultServiceOptions.port}`,
        `-rpcuser=${defaultServiceOptions.rpcuser}`,
        `-rpcpassword=${defaultServiceOptions.rpcpassword}`,
        '-rpcallowip=0.0.0.0/0',
        '-regtest=1',
        '-keypool=1',
        '-addressindex=1',
        '-spentindex=1',
        '-txindex=1',
        '-timestampindex=1',
        '-daemon=0',
        `-rpcport=${defaultServiceOptions.rpcport}`,
        `-zmqpubrawtx=${defaultServiceOptions.zmqpubrawtx}`,
        `-zmqpubrawtxlock=${defaultServiceOptions.zmqpubrawtxlock}`,
        `-zmqpubhashblock=${defaultServiceOptions.zmqpubhashblock}`,
        `-zmqpubhashtx=${defaultServiceOptions.zmqpubhashtx}`,
        `-zmqpubhashtxlock=${defaultServiceOptions.zmqpubhashtxlock}`,
        `-zmqpubrawblock=${defaultServiceOptions.zmqpubrawblock}`,
      ],
    };

    const defaultOptions = defaultServiceOptions;
    defaultOptions.container = defaultContainerOptions;

    return super.mergeWithDefaultOptions(
      defaultOptions,
      AxeCoreOptions.defaultCustomOptions,
      ...customOptions,
    );
  }

  /**
   * Get axed port
   *
   * @returns {number}
   */
  getAxedPort() {
    return this.options.port;
  }

  /**
   * Get ZMQ ports
   *
   * @returns {{rawtx: string, rawtxlock: string, hashblock: string,
   *            hashtx: string, hashtxlock: string, rawblock: string}}
   */
  getZmqPorts() {
    return {
      rawtx: this.options.zmqpubrawtx.split(':')[2],
      rawtxlock: this.options.zmqpubrawtxlock.split(':')[2],
      hashblock: this.options.zmqpubhashblock.split(':')[2],
      hashtx: this.options.zmqpubhashtx.split(':')[2],
      hashtxlock: this.options.zmqpubhashtxlock.split(':')[2],
      rawblock: this.options.zmqpubrawblock.split(':')[2],
    };
  }

  /**
   * Get RPC port
   *
   * @returns {number}
   */
  getRpcPort() {
    return this.options.rpcport;
  }

  /**
   * Get RPC user
   *
   * @returns {string}
   */
  getRpcUser() {
    return this.options.rpcuser;
  }

  /**
   * Get RPC password
   *
   * @returns {string}
   */
  getRpcPassword() {
    return this.options.rpcpassword;
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

AxeCoreOptions.defaultCustomOptions = {};

module.exports = AxeCoreOptions;
