const startHelperWithMochaHooksFactory = require('./startHelperWithMochaHooksFactory');
const startAxeCore = require('../services/axeCore/startAxeCore');

module.exports = startHelperWithMochaHooksFactory(startAxeCore);
