const Yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const PenclPlugin = require('pencl-base/src/Boot/PenclPlugin');
const CLIForm = require('./src/CLIForm');

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
    this.yargs = null;
    this.hooks = null;
  }

  getForm() {
    return new CLIForm();
  }

  /**
   * @param {cliHook[]} hooks
   */
  setHooks(hooks) {
    this.hooks = hooks;
  }

  async execute() {
    this.yargs = Yargs(hideBin(process.argv));
    this.yargs.scriptName('pencl');
    for (let hook of this.hooks) {
      if (!Array.isArray(hook)) hook = [hook];
      for (const item of hook) {
        this.command(item.command, item.description, item.builder || (yargs => yargs), item.execute);
      }
    }
    await this.yargs.argv;
  }

  /**
   * @param {string} command 
   * @param {string} description 
   * @param {Function} definition 
   * @param {Function} execute
   * @returns {Yargs}
   */
  command(command, description, definition, execute) {
    return this.yargs.command(command, description, definition, async (argv) => {
      this.argv = argv;
      await execute(this);
    });
  }

}

module.exports = new PenclCliLauncher();