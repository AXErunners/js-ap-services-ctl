class DockerService {
  /**
   * Create Docker instance
   *
   * @param {Network} network
   * @param {Image} image
   * @param {Container} container
   * @param {DockerServiceOptions} options
   */
  constructor(network, image, container, options) {
    this.network = network;
    this.image = image;
    this.container = container;
    this.options = options;
  }

  /**
   * Start container
   *
   * @return {Promise<void>}
   */
  async start() {
    await this.network.create();
    await this.image.pull();
    await this.startContainer();
  }

  /**
   * Stop container
   *
   * @return {Promise<void>}
   */
  async stop() {
    await this.container.stop();
  }

  /**
   * Clean instance
   *
   * @returns {Promise<DockerService>}
   */
  // eslint-disable-next-line
  async clean() {
  }

  /**
   * Connect instances
   *
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line
  async connect(otherInstance) {
  }

  /**
   * Remove container
   *
   * @return {Promise<void>}
   */
  async remove() {
    await this.container.remove();
  }

  /**
   * Get container IP
   *
   * @return {String}
   */
  getIp() {
    return this.container.getIp();
  }

  /**
   * Check if container is initialized
   *
   * @return {Boolean}
   */
  isInitialized() {
    return this.container.isInitialized();
  }

  /**
   * @private
   *
   * @return {Promise<void>}
   */
  async startContainer() {
    try {
      await this.container.start();
    } catch (error) {
      if (!this.isPortAllocated(error)) {
        throw error;
      }
      this.options.regeneratePorts();
      const containerOptions = this.options.getContainerOptions();
      this.container.setOptions(containerOptions);
      await this.startContainer();
    }
  }

  /**
   * @private
   *
   * @return {Boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  isPortAllocated(error) {
    const messages = [
      'already allocated',
      'already in use',
    ];
    const errors = messages.filter(message => error.message.includes(message));
    return !!errors.length;
  }
}

module.exports = DockerService;
