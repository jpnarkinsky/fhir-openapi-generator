const fhirpath = require('fhirpath');
const inflected = require('inflected');
const _ = require('lodash');
const Promise = require('bluebird');

const renderParameter = require('./parameter');

const hasInteractionPath = fhirpath.compile(
  `interaction.where(code = %interaction).exists()`,
);

hasInteraction = (rsc, interaction) =>
  _.first(hasInteractionPath(rsc, { interaction }));

module.exports = async function path(structureDefinition, options) {
  let result = {};

  // available interactions -- read | vread | update | patch | delete | history-instance | history-type | create | search-type
  if (hasInteraction(structureDefinition, 'search-type')) {
    result = _.assign({}, await renderSearch(structureDefinition));
  }

  if (hasInteraction(structureDefinition, 'read')) {
    result = _.assign({}, await renderRead(structureDefinition));
  }


  return result;
};

/**
 * Render a read interaction
 *
 * @param {Object} structureDefinition
 * @return {Promise<Object>}
 */
async function renderRead(structureDefinition) {
  const resourceType = `${structureDefinition.type}`;

  const parameters = await Promise.map(
    fhirpath.evaluate(structureDefinition, 'searchParam'),
    (param) => renderParameter(param, {in: 'query'}),
  );

  const result = {
    [`/${inflected.classify(resourceType)}/:id`]: {
      get: {
        summary: `Read a ${inflected.classify(resourceType)} by id`,
        parameters,
        operationId: `get${inflected.classify(resourceType)}`,
        responses: {
          200: {
            'description': `A FHIR ${inflected.classify(resourceType)}`,
            'content': {
              'application/fhir+json': {
                'schema': {
                  '$ref': `#/components/schemas/${inflected.classify(resourceType)}`,
                },
              },
            },
          },
          400: {
            description: `Search could not be processed or failed basic FHIR validation rules`,
          },
          401: {
            description: 'Not Authorized',
          },
          403: {
            description: 'Forbidden',
          },
          404: {
            description: 'Not found',
          },
        },
      },
    },
  };
  return result;
}


/**
 * Render a search interaction
 *
 * @param {Object} structureDefinition
 * @return {Promise<Object>}
 */
async function renderSearch(structureDefinition) {
  const resourceType = `${structureDefinition.type}`;

  const parameters = await Promise.map(
    fhirpath.evaluate(structureDefinition, 'searchParam'),
    (param) => renderParameter(param, {in: 'query'}),
  );

  const result = {
    [`/${inflected.classify(resourceType)}`]: {
      get: {
        summary: `Search for ${inflected.pluralize(resourceType)}`,
        parameters,
        operationId: `searchFor${resourceType}`,
        responses: {
          200: {
            'description': `A FHIR Bundle of ${inflected.pluralize(resourceType)}`,
            'content': {
              'application/fhir+json': {
                'schema': {
                  '$ref': '#/components/schemas/Bundle',
                },
              },
            },
          },
          400: {
            description: `Search could not be processed or failed basic FHIR validation rules`,
          },
          401: {
            description: 'Not Authorized',
          },
          403: {
            description: 'Forbidden',
          },
          404: {
            description: 'Not found',
          },
        },
      },
    },
    // TODO: add post version
  };
  return result;
}
