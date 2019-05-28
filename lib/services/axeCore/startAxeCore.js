const createAxeCore = require('./createAxeCore');
const wait = require('../../util/wait');

/**
 * Start and stop Axecore instance for mocha tests
 *
 * @param {object} [options]
 * @return {Promise<AxeCore>}
 */
async function startAxeCore(options) {
  const instances = await startAxeCore.many(1, options);

  return instances[0];
}

/**
 * Start and stop a specific number of Axecore instances for mocha tests
 *
 * @param {number} number
 * @param {object} [options]
 * @return {Promise<AxeCore[]>}
 */
startAxeCore.many = async function many(number, options) {
  if (number < 1) {
    throw new Error('Invalid number of instances');
  }

  const instances = [];

  for (let i = 0; i < number; i++) {
    const instance = await createAxeCore(options);
    await instance.start();

    // Workaround for develop branch
    // We should generate genesis block before we connect instances
    if (i === 0 && number > 1) {
      await instance.getApi().generate(1);
    }

    if (instances.length > 0) {
      await instances[i - 1].connect(instance);
    }
    instances.push(instance);
  }

  // Wait until generate block will be propagated
  if (number > 1) {
    await wait(2000);
  }

  return instances;
};

module.exports = startAxeCore;
