const startDapi = require('../../../lib/mocha/startDapi');

describe('startDapi', () => {
  describe('One node', () => {
    let dapiNode;

    startDapi().then((instance) => {
      dapiNode = instance;
    });

    it('should have all Dapi containers running', async () => {
      const { State: stateDapiCore } = await dapiNode.dapiCore.container.inspect();
      expect(stateDapiCore.Status).to.equal('running');

      const {
        State: stateDapiTxFilterStream,
      } = await dapiNode.dapiTxFilterStream.container.inspect();
      expect(stateDapiTxFilterStream.Status).to.equal('running');

      const { State: stateAxeCore } = await dapiNode.axeCore.container.inspect();
      expect(stateAxeCore.Status).to.equal('running');

      const { State: stateMongoDb } = await dapiNode.mongoDb.container.inspect();
      expect(stateMongoDb.Status).to.equal('running');

      const { State: stateDriveApi } = await dapiNode.driveApi.container.inspect();
      expect(stateDriveApi.Status).to.equal('running');

      const { State: stateDriveSync } = await dapiNode.driveSync.container.inspect();
      expect(stateDriveSync.Status).to.equal('running');

      const { State: stateInsight } = await dapiNode.insightApi.container.inspect();
      expect(stateInsight.Status).to.equal('running');
    });
  });

  describe.skip('Many nodes', () => {
    const nodesCount = 2;

    let dapiNodes;

    startDapi.many(nodesCount).then((instances) => {
      dapiNodes = instances;
    });

    it('should have all containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].axeCore.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have MongoDb containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].mongoDb.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have Drive API containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].mongoDb.container.inspect();

        expect(State.Status).to.equal('running');
      }
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].driveApi.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have Drive sync containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].driveSync.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have Insight containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].insightApi.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have DAPI Core containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].dapiCore.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });

    it('should have DAPI TxFilterStream containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await dapiNodes[i].dapiTxFilterStream.container.inspect();

        expect(State.Status).to.equal('running');
      }
    });
  });
});
