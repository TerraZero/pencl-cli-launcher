module.exports = class FieldBuilder {

  /**
   * @param {import('./Form')} form 
   * @param {object} definition
   */
  constructor(form, definition = {}) {
    this.form = form;
    this.definition = definition;
  }

  /**
   * @param {string} type 
   * @returns {this}
   */
  type(type) {
    this.definition.type = string;
    return this;
  }

  /**
   * @param {string} key 
   * @returns {this}
   */
  name(key) {
    this.definition.name = key;
    return this;
  }

  /**
   * @param {string} message 
   * @returns {this}
   */
  message(message) { 
    this.definition.message = message;
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

}