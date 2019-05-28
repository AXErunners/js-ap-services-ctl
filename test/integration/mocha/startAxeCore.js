const startAxeCore = require('../../../lib/mocha/startAxeCore');

describe('startAxeCore', () => {
  describe('One node', () => {
    let axeCoreNode;

    startAxeCore().then((instance) => {
      axeCoreNode = instance;
    });

    it('should have container running', async () => {
      const { State } = await axeCoreNode.container.inspect();

      expect(State.Status).to.equal('running');
    });
  });

  describe('Many nodes', () => {
    const nodesCount = 2;

    let axeCoreNodes;

    startAxeCore.many(nodesCount).then((instances) => {
      axeCoreNodes = instances;
    });

    it('should have containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State } = await axeCoreNodes[i].container.inspect();

        expect(State.Status).to.equal('running');
      }
    });
  });
});
