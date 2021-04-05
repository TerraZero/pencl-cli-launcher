/**
 * @callback fieldBuilderCallback
 * @param {CLIFieldBuilder} field
 */

/**
 * @typedef {Object} definitionObject
 * @property {string} type
 * @property {string} name
 * @property {string} [message]
 * @property {(defaultCallback|string|number|array|boolean)} [default]
 * @property {(number[]|string[]|choiceItem[]|choicesCallback)} [choices]
 * @property {validateCallback} [validate] 
 * @property {filterCallback} [filter] 
 * @property {transformerCallback} [transformer] 
 * @property {whenCallback} [when]
 * @property {number} [pageSize] 
 * @property {string} [prefix] 
 * @property {string} [suffix] 
 * @property {boolean} [askAnswered] 
 * @property {boolean} [loop] 
 * @property {autocompleteCallback} [source] 
 * @property {choiceItem[]} [columns] 
 * @property {choiceItem[]} [rows] 
 */

/**
 * @typedef {Object} choiceItem
 * @property {string} name
 * @property {*} value
 * @property {string} [short]
 */

/**
 * @callback choicesCallback
 * @param {Object.<string, *>} bag
 * @returns {(number[]|string[]|choiceItem[])}
 */

/**
 * @callback validateCallback
 * @param {string} input
 * @param {Object.<string, *>} bag
 * @returns {(boolean|string)}
 */

/**
 * @callback filterCallback
 * @param {string} input
 * @param {Object.<string, *>} bag
 * @returns {*}
 */

/**
 * @callback defaultCallback
 * @param {Object.<string, *>} bag
 * @returns {*}
 */

/**
 * @callback transformerCallback
 * @param {string} input
 * @param {Object.<string, *>} bag
 * @param {*} flags
 * @returns {string}
 */

/**
 * @callback whenCallback
 * @param {Object.<string, *>} bag
 * @returns {boolean}
 */

/**
 * @callback autocompleteCallback
 * @param {Object.<string, *>} bag
 * @param {string} input
 * @returns {string[]}
 */

module.exports = class CLIFieldBuilder {

  /**
   * @param {import('./CLIForm')} form 
   * @param {definitionObject} definition
   * @param {fieldBuilderCallback} callback
   */
  constructor(form, definition = {}, callback = null) {
    this.form = form;
    this.definition = definition;
    this.callback = callback;
    this.inited = false;
  }

  /**
   * @returns {definitionObject}
   */
  execute() {
    if (!this.inited) {
      this.inited = false;
      if (typeof this.callback === 'function') {
        this.callback(this);
      }
    }
    return this.definition;
  }

  /**
   * @param {string} type 
   * @param {string} plugin 
   * @returns {this}
   */
  plugin(type, plugin) {
    if (!require('./CLIForm').checkPlugin(type, plugin)) {
      throw new Error('Please install plugin "' + plugin + '" (npm install ' + plugin + ')');
    }
    return this;
  }

  /**
   * @param {string} name 
   * @param {*} value 
   * @returns {this}
   */
  set(name, value) {
    this.definition[name] = value;
    return this;
  }

  /**
   * @param {string} name 
   * @returns {*}
   */
  get(name) {
    return this.definition[name];
  }

  /**
   * Type of the prompt. Defaults: input - Possible values: `input`, `number`, `confirm`, `list`, `rawlist`, `expand`, `checkbox`, `password`, `editor`
   * 
   * @param {string} type 
   * @returns {this}
   */
  type(type) {
    return this.set('type', type);
  }

  /**
   * The name to use when storing the answer in the answers hash. If the name contains periods, it will define a path in the answers hash.
   * 
   * @param {string} name 
   * @returns {this}
   */
  name(name) {
    return this.set('name', name);
  }

  /**
   * @param {definitionObject} definitions
   * @returns {this}
   */
  definitions(definitions) {
    for (const field in definitions) {
      this.set(field, definitions[field]);
    }
    return this;
  }

  /**
   * The question to print. If defined as a function, the first parameter will be the current inquirer session answers. Defaults to the value of name (followed by a colon).
   * 
   * @param {string} message 
   * @returns {this}
   */
  message(message) {
    return this.set('message', message);
  }

  /**
   * Default value(s) to use if nothing is entered, or a function that returns the default value(s). If defined as a function, the first parameter will be the current inquirer session answers.
   * 
   * @param {(defaultCallback|string|number|array|boolean)} default_value
   * @returns {this}
   */
  default(default_value) {
    return this.set('default', default_value);
  }

  /**
   * Choices array or a function returning a choices array. If defined as a function, the first parameter will be the current inquirer session answers. Array values can be simple `numbers`, `strings`, or `objects` containing a `name` (to display in list), a `value` (to save in the answers hash), and a `short` (to display after selection) properties.
   * 
   * @param {(number[]|string[]|choiceItem[]|choicesCallback)} choices
   * @returns {this}
   */
  choices(choices) {
    return this.set('choices', choices);
  }

  /**
   * Receive the user input and answers hash. Should return `true` if the value is valid, and an error message `(String)` otherwise. If `false` is returned, a default error message is provided.
   * 
   * @param {validateCallback} validate 
   * @returns {this}
   */
  validate(validate) {
    return this.set('validate', validate);
  }

  /**
   * Receive the user input and answers hash. Returns the filtered value to be used inside the program. The value returned will be added to the Answers hash.
   * 
   * @param {filterCallback} filter 
   * @returns {this}
   */
  filter(filter) {
    return this.set('filter', filter);
  }

  /**
   * Receive the user input, answers hash and option flags, and return a transformed value to display to the user. The transformation only impacts what is shown while editing. It does not modify the answers hash.
   * 
   * @param {transformerCallback} transformer 
   * @returns {this}
   */
  transformer(transformer) {
    return this.set('transformer', transformer);
  }

  /**
   * Receive the current user answers hash and should return `true` or `false` depending on whether or not this question should be asked. The value can also be a simple boolean.
   * 
   * @param {whenCallback} when
   * @returns {this}
   */
  when(when) {
    return this.set('when', when);
  }

  /**
   * Change the number of lines that will be rendered when using `list`, `rawList`, `expand` or `checkbox`.
   * 
   * @param {number} pageSize 
   * @returns {this}
   */
  pageSize(pageSize) {
    return this.set('pageSize', pageSize);
  }

  /**
   * Change the default prefix message.
   * 
   * @param {string} prefix 
   * @returns {this}
   */
  prefix(prefix) {
    return this.set('prefix', prefix);
  }

  /**
   * Change the default suffix message.
   * 
   * @param {string} suffix 
   * @returns {this}
   */
  suffix(suffix) {
    return this.set('suffix', suffix);
  }

  /**
   * Force to prompt the question if the answer already exists.
   * 
   * @param {boolean} askAnswered 
   * @returns {this}
   */
  askAnswered(askAnswered) {
    return this.set('askAnswered', askAnswered);
  }

  /**
   * Enable list looping. Defaults: `true`
   * 
   * @param {boolean} loop 
   * @returns {this}
   */
  loop(loop) {
    return this.set('loop', loop);
  }

  /**
   * Needs plugin `inquirer-autocomplete-prompt` as type `autocomplete` use `this.plugin('autocomplete', 'inquirer-autocomplete-prompt')` to load plugin
   * 
   * @param {autocompleteCallback} source 
   * @returns {this}
   */
  source(source) {
    return this.set('source', source);
  }

  /**
   * Needs plugin `inquirer-table-prompt` as type `table` use `this.plugin('table', 'inquirer-table-prompt')` to load plugin
   * 
   * @param {choiceItem[]} columns 
   * @returns {this}
   */
  columns(columns) {
    return this.set('columns', columns);
  }

  /**
   * Needs plugin `inquirer-table-prompt` as type `table` use `this.plugin('table', 'inquirer-table-prompt')` to load plugin
   * 
   * @param {choiceItem[]} rows 
   * @returns {this}
   */
  rows(rows) {
    return this.set('rows', rows);
  }

}