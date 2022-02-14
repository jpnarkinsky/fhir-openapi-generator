const fhirpath = require('fhirpath');
module.exports = async function(capabilityStatement, options) {
  return {
    '/metadata': {
      'get': {
        'operationId': 'getMetadata',
        'summary': 'Return the server\'s capability statement',
        'parameters': [
          {
            'in': 'query',
            'name': '_format',
            'description': 'The format to use when returning the capability statement',
            'schema': {
              'type': 'string',
              'enum': fhirpath.evaluate(capabilityStatement, 'format'),
            },
          },
        ],
        'responses': {
          '200': {
            'description': 'A FHIR CapabilityStatement',
            'content': {
              'application/fhir+json': {
                'schema': {
                  '$ref': '#/components/schemas/CapabilityStatement',
                },
              },
            },
          },
          '400': {
            'description': 'Search could not be processed or failed basic FHIR validation rules',
          },
          '401': {
            'description': 'Not Authorized',
          },
          '403': {
            'description': 'Forbidden',
          },
          '404': {
            'description': 'Not found',
          },
        },
      },
    },
  };
};
