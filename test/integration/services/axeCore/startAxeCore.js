const removeContainers = require('../../../../lib/docker/removeContainers');
const { startAxeCore } = require('../../../../lib');

const wait = require('../../../../lib/util/wait');

describe('startAxeCore', function main() {
  this.timeout(60000);

  before(removeContainers);

  describe('One node', () => {
    const CONTAINER_VOLUME = '/usr/src/app/README.md';
    let axeCoreNode;

    before(async () => {
      const rootPath = process.cwd();
      const container = {
        volumes: [
          `${rootPath}/README.md:${CONTAINER_VOLUME}`,
        ],
      };
      const options = { container };

      axeCoreNode = await startAxeCore(options);
    });

    after(async () => axeCoreNode.remove());

    it('should have container running', async () => {
      const { State, Mounts } = await axeCoreNode.container.inspect();

      expect(State.Status).to.equal('running');
      expect(Mounts[0].Destination).to.equal(CONTAINER_VOLUME);
    });

    it('should have RPC connected', async () => {
      const { result } = await axeCoreNode.rpcClient.getInfo();

      expect(result).to.have.property('version');
    });
  });

  describe('Many nodes', () => {
    const nodesCount = 2;
    const CONTAINER_VOLUME = '/usr/src/app/README.md';

    let axeCoreNodes;

    before(async () => {
      const rootPath = process.cwd();
      const container = {
        volumes: [
          `${rootPath}/README.md:${CONTAINER_VOLUME}`,
        ],
      };
      const options = { container };

      axeCoreNodes = await startAxeCore.many(nodesCount, options);
    });

    after(async () => {
      await Promise.all(
        axeCoreNodes.map(instance => instance.remove()),
      );
    });

    it('should have containers running', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { State, Mounts } = await axeCoreNodes[i].container.inspect();

        expect(State.Status).to.equal('running');
        expect(Mounts[0].Destination).to.equal(CONTAINER_VOLUME);
      }
    });

    it('should propagate blocks between nodes', async () => {
      for (let i = 0; i < nodesCount; i++) {
        const { result: blocks } = await axeCoreNodes[i].rpcClient.getBlockCount();

        expect(blocks).to.equal(1);
      }

      await axeCoreNodes[0].rpcClient.generate(2);

      await wait(5000);

      for (let i = 0; i < nodesCount; i++) {
        const { result: blocks } = await axeCoreNodes[i].rpcClient.getBlockCount();

        expect(blocks).to.equal(3);
      }
    });
  });
});
