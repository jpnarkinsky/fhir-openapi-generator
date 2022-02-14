const fhirpath = require('fhirpath');
const _ = require('lodash');
const Promise = require('bluebird');

const renderMetadata = require('./metadata');
const renderPath = require('./path');
const renderReferences = require('./references');
const renderServers = require('./servers');
const { evaluateOne } = require('../util');

module.exports = async function render(metadata, options = {}) {
  const result = {
    openapi: '3.0.3',
    info: {
      title: evaluateOne(metadata, `title | name | url | software.name | 'Unknown'`),
      description: evaluateOne(metadata, 'implementation.description'),
      version: evaluateOne(metadata, 'version | software.version'),
    },
    servers: await renderServers(metadata, options),
    paths: await Promise.reduce(
      fhirpath.evaluate(metadata, `rest.resource`),
      async (acc, i) => {
        return _.assign(acc, await renderPath(i, options));
      },
      await renderMetadata(metadata),
    ),
    components: {
      schemas: {},
    },
    security: [],
    tags: [],
  };

  result.components.schemas = await renderReferences(result, options);
  return result;
};
