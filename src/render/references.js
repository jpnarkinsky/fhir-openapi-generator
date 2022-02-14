const fs = require('fs');
const path = require('path');
const _ = require('lodash');


const masterSchema = JSON.parse(fs.readFileSync(
  path.join( __dirname,
    '..',
    '..',
    'node_modules',
    'hl7.fhir.r4.core',
    'openapi',
    'fhir.schema.json',
  ),
));

const debug = require('debug')('fhir-openapi-generator:references');

/**
 * Visit every node in the provided object and find resource references.
 *
 * @param {String} value
 * @param {String} key
 * @return {Array<String>}
 */
function getReferences(value, key) {
  if (key == '$ref') {
    return path.basename(value);
  }

  if (_.isArray(value)) {
    return _(value)
      .map(getReferences)
      .flatten()
      .compact()
      .uniq()
      .value();
  }

  if (_.isObject(value)) {
    return _(value)
      .mapValues(getReferences)
      .values()
      .flatten()
      .compact()
      .uniq()
      .value();
  }

  return null;
}

/**
 * Visit every node in the provided object and fix resource references.
 *
 * @param {String} value
 * @param {String} key
 * @return {Array<String>}
 */
function fixReferences(value, key) {
  debug(`Fixing references for ${key} with value of type ${_.isArray(value) ? 'array' : _.isObject(value) ? 'object' : typeof value}`);
  if (_.isArray(value)) {
    const result = _(value)
      .map(fixReferences)
      .value();
    return result;
  }

  if (_.isObject(value)) {
    const result = _(value)
      .mapValues(fixReferences)
      .pickBy(_.identity)
      .value();
    return result;
  }

  if (key == '$ref') {
    const refType = path.basename(value);
    if (_.has(masterSchema, `definitions.${refType}`)) {
      return `#/components/schemas/${refType}`;
    }
    console.warn(`Removing reference to unrecognizable resource ${refType}`);
    return undefined;
  }

  return value;
}

/**
 * Iterate through schemas and include the FHIR openapi modules
 * if they're available.
 *
 * @param {Object} schemas
 * @param {Object} references
 *
 * @return {Object} new schemas
 */
function makeSchemas(schemas, references) {
  const result = _.reduce(
    references,
    (prev, curr) => {
      // debug(`Processing reference for ${curr}`);
      if (!_.has(prev, curr)) {
        debug(`${curr} schema not found.  Reading`);
        try {
          const schema = _.get(masterSchema, `definitions.${curr}`);
          if (_.has(schema, 'properties.resourceType')) {
            schema.properties.resourceType = {
              description: `This is an ${curr} resource`,
              type: 'string',
            };
          }
          prev = Object.assign({}, prev, {[curr]: schema});
          prev = Object.assign({}, prev, makeSchemas(prev, getReferences(schema)));
        } catch (error) {
          debug(error);
          prev[curr] = null;
          console.error(`caught error trying to add schema for ${curr}: ${error.message}`);
        }
      }
      return prev;
    },
    schemas,
  );
  return _.pickBy(_.identity(result));
}

module.exports = async function renderReferences(content, options) {
  let schemas = makeSchemas({}, getReferences(content));
  schemas = fixReferences(schemas);
  return schemas;
};
