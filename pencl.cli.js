module.exports = {

  command: 'serve [port]',
  description: 'Test',

  /**
   * @param {import('yargs')} yargs 
   * @returns 
   */
  builder: (yargs) => {
    return yargs.positional('port', {
      describe: 'port to bind on',
      default: 5000,
    });
  },

  /**
   * @param {import('pencl-cli-launcher')} cli 
   */
  execute: async (cli) => {
    const form = cli.getForm();

    const options = ['hallo', 'huhn', 'cool', 'cookcook'];
    form.select('test', 'Test:', options);
    form.input('cwd', 'CWD:');
    form.table('plan', 'Plan:', [
      {
        name: "Arms",
        value: "arms"
      },
      {
        name: "Legs",
        value: "legs"
      },
    ], [
      {
        name: "Monday",
        value: 0
      },
      {
        name: "Tuesday",
        value: 1
      },
    ]);
    await form.execute();
    console.log(form.values);
  },

}