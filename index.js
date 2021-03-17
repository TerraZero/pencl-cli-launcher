const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const PenclPlugin = require('pencl-base/src/Boot/PenclPlugin');

/**
 * @callback cliHook
 * @param {PenclCliLauncher} launcher
 */

class PenclCliLauncher extends PenclPlugin {

  get name() {
    return 'clilauncher'; 
  }

  get config() {
    return {
      isCli: false,
    };
  }

  constructor() {
    super();
    this._yargs = null;
    this._hooks = null;
  }

  /**
   * @param {cliHook[]} hooks
   */
  setHooks(hooks) {
    this._hooks = hooks;
  }

  async execute() {
    this._yargs = Yargs(hideBin(process.argv));
    for (const hook of this._hooks) {
      await hook(this);
    }
    this._yargs.argv;
  }

  /**
   * @param {string} command 
   * @param {string} description 
   * @param {Function} definition 
   * @param {Function} execute
   * @returns {Yargs}
   */
  command(command, description, definition, execute) {
    return this._yargs.command(command, description, definition, execute);
  }

}

module.exports = new PenclCliLauncher();