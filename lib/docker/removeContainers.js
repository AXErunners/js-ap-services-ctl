const Docker = require('dockerode');

async function removeContainer() {
  const docker = new Docker();
  const containers = await docker.listContainers();
  containers.forEach(async (containerInfo) => {
    if (containerInfo.Labels.testHelperName === 'AxeTestContainer') {
      const container = docker.getContainer(containerInfo.Id);
      await container.stop();
      await container.remove({ v: 1 });
    }
  });
}

module.exports = removeContainer;
