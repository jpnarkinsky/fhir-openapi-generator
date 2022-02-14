const { program } = require('commander');
const Client = require('fhir-kit-client');
const fs = require('fs');
const { URL } = require('url');
const render = require('./render');
const debug = require('debug')('fhir-openapi-generator:cli');
const _ = require('lodash');

// const package = JSON.parse(
//   fs.readFileSync(path.join(__dirname, '../package.json')),
// );

/**
 * Main procedure called when this is called as a cli
 */
async function main() {
  program
    .argument(
      'location...',
      'Either a file path or the BASE path of a FHIR server from which the capability statement can be fetched',
    )
    .action(async (location) => {
      for (const loc of location) {
        let content;
        const options={};

        try {
          const url = new URL(loc);
          const client = new Client({ baseUrl: url.toString() });
          content = await client.capabilityStatement();

          if (!_.has(options, 'baseUrl')) {
            options.baseUrl = url.toString();
          }
        } catch (error) {
          debug(error);
          content = JSON.parse(fs.readFileSync(loc));
        }

        const result = await render(content, options);
        console.log(JSON.stringify(result, null, 2));
      }
    })
    .parseAsync();
}

if (require.main === module) {
  main().catch(console.error);
} else {
  module.exports = render;
}
