/* eslint-disable global-require */
describe('Mocha', () => {
  require('./startAxeCore');
  require('./startDrive');
  require('./startIPFS');
  require('./startMongoDb');
  require('./startDapi');
});
