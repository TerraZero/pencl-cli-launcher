const Inquirer = require('inquirer');
const FieldBuilder = require('./FieldBuilder');
/**
 * @callback fieldBuilderCallback
 * @param {FieldBuilder} field
 */

/**
 * @callback autocompleteCallback
 * @param {object} answersSoFar
 * @param {string} input
 * @returns {string[]}
 */

module.exports = class Form {

  constructor() {
    this.fields = [];
    this._loaded_plugins = [];
  }

  checkPlugin(type, plugin) {
    if (this._loaded_plugins.includes(plugin)) return true;
    let nodePlugin = null;
    try {
      nodePlugin = require(plugin);
    } catch (e) {
      console.error('Please install plugin "' + plugin + '" (npm install ' + plugin + ')');
      return false;
    }
    Inquirer.registerPrompt(type, nodePlugin);
    return true;
  }

  /**
   * @param {fieldBuilderCallback} callback 
   * @param {object} definition
   * @returns {this}
   */
  field(callback, definition = {}) {
    const field = new FieldBuilder(this, definition);
    callback(field);
    this.fields.push(field.definition);
    return this;
  }

  /**
   * @param {string} name 
   * @param {string} message 
   * @param {autocompleteCallback} source 
   * @returns 
   */
  autocomplete(name, message, source) {
    if (this.checkPlugin('autocomplete', 'inquirer-autocomplete-prompt')) {
      if (typeof name === 'function') {
        return this.field(name, {
          type: 'autocomplete',
        });
      }
      this.fields.push({
        type: 'autocomplete',
        name: name, 
        message: message, 
        source: source,
      });
    }
    return this;
  }

  async execute() {
    try {
      this.values = await Inquirer.prompt(this.fields)
    } catch (e) {
      this.error = e;
    }
    return this;
  }

}