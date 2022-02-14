const debug = require('debug')('fhir-openapi-generator');

module.exports = async function renderParameter(searchParam, options={}) {
  if (!options.in) {
    options.in = 'query';
  }

  switch (searchParam.type) {
      case 'number':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'integer' },
          example: 123456,
        };
      case 'date':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
          examples: {
            'exact date': {
              value: '2013-01-14',
              summary: 'find where date matches 2013-01-14',
            },
            'before a time': {
              value: 'lt2013-01-14T10:00',
              summary: 'find where date is before January 14, 2013 at 10AM',
            },
            'after a time': {
              value: 'gt2013-01-14T10:00',
              summary: 'search after January 14, 2013 at 10AM',
            },
          },
        };
      case 'token':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
          examples: {
            'by code only': {
              value: '[code]',
              summary: `the value of [code] matches a Coding.code or Identifier.value irrespective of the value of the system property`,
            },
            'by system+code': {
              value: '[system]|[code]',
              summary: `the value of [code] matches a Coding.code or Identifier.value, and the value of [system] matches the system property of the Identifier or Coding`,
            },
            'by code with no system': {
              value: '|[code]',
              summary: `the value of [code] matches a Coding.code or Identifier.value, and the Coding/Identifier has no system property`,
            },
            'by system only': {
              value: '[system]|',
              summary: `any element where the value of [system] matches the system property of the Identifier or Coding`,
            },
          },
        };
      case 'reference':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
      case 'composite':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
      case 'quantity':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
      case 'uri':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
      case 'special':
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
      default:
        debug(`Unsuppored parameter resource type ${searchParam.name}: ${searchParam.type}`);
        return {
          name: searchParam.name,
          in: options.in,
          schema: {type: 'string' },
        };
  }
};

