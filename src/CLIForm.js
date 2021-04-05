const Inquirer = require('inquirer');
const CLIFieldBuilder = require('./CLIFieldBuilder');
const Handler = require('pencl-base/src/Util/Handler');
const Reflection = require('pencl-base/src/Util/Reflection');

module.exports = class CLIForm {

  /**
   * @param {string} type 
   * @param {string} plugin 
   * @returns {boolean}
   */
  static checkPlugin(type, plugin) {
    this._loaded_plugins = this._loaded_plugins || [];
    if (this._loaded_plugins.includes(plugin)) return true;
    let nodePlugin = null;
    try {
      nodePlugin = require(plugin);
    } catch (e) {
      console.error('Please install plugin "' + plugin + '" (npm install ' + plugin + ')');
      return false;
    }
    Inquirer.registerPrompt(type, nodePlugin);
    this._loaded_plugins.push(plugin);
    return true;
  }

  constructor() {
    this.fields = [];
    this.values = null;
    this.bottom = null;
    this._error = null;
    this._loaded_plugins = [];

    this.handler = new Handler();
  }

  get error() {
    return this._error;
  }

  set error(error) {
    this._error = error;
    this.handler.emit('error', this, error);
  }

  /**
   * @param {string} name 
   * @returns {CLIFieldBuilder}
   */
  getField(name) {
    for (const field of this.fields) {
      if (field.definition.name === name) return field;
    }
    return null;
  }

  /**
   * @param {string} field 
   * @returns {any}
   */
  getValue(field) {
    return Reflection.getDeep(this.values, field);
  }

  /**
   * @param {string} field 
   * @param {any} value 
   * @returns {this}
   */
  setValue(field, value) {
    Reflection.setDeep(this.values, field, value);
    return this;
  }

  /**
   * @param {string} type
   * @param {string} name
   * @param {object} definition
   * @returns {CLIFieldBuilder}
   */
  field(type, name, definition = {}) {
    definition.type = type;
    definition.name = name;
    const field = new CLIFieldBuilder(this, definition);
    this.fields.push(field);
    return field;
  }

  /**
   * @param {string} name 
   * @param {string} message 
   * @returns {CLIFieldBuilder}
   */
  input(name, message) {
    return this.field('input', name, {
      message: message + ': ',
    });
  }

  /**
   * @param {string} name 
   * @param {string} message 
   * @param {import('./CLIFieldBuilder').choiceItem[]} choices
   * @returns {CLIFieldBuilder}
   */
  select(name, message, choices = null) {
    return this.field('list', name, {
      message: message + ': ',
      choices,
    });
  }

  /**
   * @param {string} name 
   * @param {string} message 
   * @param {import('./CLIFieldBuilder').autocompleteCallback} source 
   * @returns {CLIFieldBuilder}
   */
  autocomplete(name, message, source) {
    if (CLIForm.checkPlugin('autocomplete', 'inquirer-autocomplete-prompt')) {
      return this.field('autocomplete', name, {
        message: message + ': ',
        source,
      });
    }
    return null;
  }

  /**
   * @param {(string|fieldBuilderCallback)} name 
   * @param {string} message 
   * @param {string[]} options
   * @returns {CLIFieldBuilder}
   */
  autoSelect(name, message, options = []) {
    return this.autocomplete(name, message, (answers, input) => {
      return options.filter((v) => v.startsWith(input));
    });
  }

  /**
   * @param {string} name 
   * @param {string} message 
   * @param {import('./CLIFieldBuilder').choiceItem[]} columns 
   * @param {import('./CLIFieldBuilder').choiceItem[]} rows 
   * @returns 
   */
  table(name, message, columns, rows) {
    if (CLIForm.checkPlugin('table', 'inquirer-table-prompt')) {
      return this.field('table', name, {
        message: message + ': ',
        columns,
        rows,
      });
    }
    return null;
  }

  /**
   * @param {string} name 
   * @param {string} message 
   */
  bool(name, message) {
    return this.field('input', name, {
      message: message + ' (y/n): ',
      validate: (input, bag) => {
        if (input === '') return 'Please use "y" for TRUE or "n" for FALSE.';
        return true;
      },
      filter: (input, bag) => {
        switch (input.toLowerCase()) {
          case 'y': 
          case 'yes':
          case 'true': 
            return true;
          case 'n': 
          case 'no':
          case 'false':
            return false;
        }
        return '';
      },
    });
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
      await this.handler.emit('execute:prompts', this);
      const prompts = this.fields.map((field) => {
        return field.execute();
      });
      await this.handler.emit('execute:before', this, prompts);
      this.values = await Inquirer.prompt(prompts);
      await this.handler.emit('execute:after', this);
    } catch (e) {
      this.error = e;
    }
    return this;
  }

}