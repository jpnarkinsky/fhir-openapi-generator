const { program } = require('commander');
const Client = require('fhir-kit-client');
const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const generate = require('./generate');

const package = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json')));


program
  .argument('location...', 'Either a file path or the BASE path of a FHIR server from which the capability statement can be fetched')
  .action(async(location) => {
    for (let loc of location) {
      let capabilityStatement;
      let content;
      try {
        const url = new URL(loc);
        const client = new Client({baseUrl: url.toString()});
        content = await client.capabilityStatement();
      } catch(error) {
        content = JSON.parse(fs.readFileSync(loc));
      }

      console.log(generate(content));
    }
  })
  .parseAsync();

