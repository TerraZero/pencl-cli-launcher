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

module.exports = class CLIForm {

  constructor() {
    this.fields = [];
    this.values = null;
    this.bottom = null;
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

  checkFieldBuilder(value, definition, builder) {
    if (typeof value === 'function') {
      this.field(value, definition);
    } else if (typeof builder === 'function') {
      this.field(builder, definition);
    } else {
      this.fields.push(definition);
    }
    return this;
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
   * @param {(string|fieldBuilderCallback)} name 
   * @param {string} message 
   * @param {fieldBuilderCallback} builder 
   * @returns {this}
   */
  input(name, message, builder) {
    return this.checkFieldBuilder(name, {
      type: 'input',
      name,
      message,
    }, builder);
  }

  /**
   * @param {(string|fieldBuilderCallback)} name 
   * @param {string} message 
   * @param {autocompleteCallback} source 
   * @param {fieldBuilderCallback} builder
   * @returns 
   */
  autocomplete(name, message, source, builder = null) {
    if (this.checkPlugin('autocomplete', 'inquirer-autocomplete-prompt')) {
      this.checkFieldBuilder(name, {
        type: 'autocomplete',
        name,
        message,
        source,
      }, builder);
    }
    return this;
  }

  /**
   * @param {(string|fieldBuilderCallback)} name 
   * @param {string} message 
   * @param {string[]} options
   * @param {fieldBuilderCallback} builder
   * @returns 
   */
  select(name, message, options = [], builder = null) {
    return this.autocomplete(name, message, (answers, input) => {
      return options.filter((v) => v.startsWith(input));
    }, builder);
  }

  /**
   * @param {(string|fieldBuilderCallback)} name 
   * @param {string} message 
   * @param {object[]} columns 
   * @param {object[]} rows 
   * @param {fieldBuilderCallback} builder 
   * @returns 
   */
  table(name, message, columns, rows, builder = null) {
    if (this.checkPlugin('table', 'inquirer-table-prompt')) {
      this.checkFieldBuilder(name, {
        type: 'table',
        name,
        message,
        columns,
        rows,
      }, builder);
    }
    return this;
  }

  setStatus(message) {
    if (this.bottom === null) {
      this.bottom = new Inquirer.ui.BottomBar();
    }
    this.bottom.updateBottomBar(message);
    return this;
  }

  async execute() {
    try {
      this.values = await Inquirer.prompt(this.fields);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

}