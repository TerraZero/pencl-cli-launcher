module.exports = [
  {
    command: 'generate:config <plugin...>',
    description: 'Add a config file for the plugin or add to existing config file.',

    /**
     * @param {import('yargs')} yargs
     */
    builder: (yargs) => {
      return yargs
        .positional('plugin', {
          type: 'array',
          description: 'The pencl-plugin',
        })
        .option('path', {
          type: 'string',
          description: 'The path where the pencl.json is located.',
          default: '.',
        });
    },

    /**
     * @param {import('./index')} cli 
     */
    execute: async (cli) => {
      const Boot = require('pencl-base');
      const Path = require('path');
      const FS = require('fs');

      let plugin = null;
      try {
        plugin = require(cli.argv.plugin);
      } catch (e) {
        console.log(e);
      }
      const form = cli.getForm();
      plugin.getConfigForm(form);
      await form.execute();

      console.log(form.values);
      let file = null;
      let data = {};
      if (Boot.file) {
        console.log('Boot', Boot.file);
        file = Boot.file;
      } else {

        if (Path.isAbsolute(cli.argv.path)) {
          console.log('abs', cli.argv.path);
          file = Path.join(cli.argv.path, 'pencl.json');
        } else {
          console.log('rel', process.cwd(), cli.argv.path);
          file = Path.join(process.cwd(), cli.argv.path, 'pencl.json');
        }
      }
      console.log('file', file);
      if (FS.existsSync(file)) {
        console.log('exist', data);
        data = require(file);
      }
      console.log(plugin.name, form.values);
      data[plugin.name] = form.values;
      FS.writeFileSync(file, JSON.stringify(data, null, '  '));
    },
  }
];