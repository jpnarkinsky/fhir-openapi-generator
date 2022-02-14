const fhirpath = require('fhirpath');
const _ = require('lodash');

module.exports = async function renderServers(metadata, options) {
  let result = [];
  if (_.first(fhirpath.evaluate(metadata, 'implementation.url.exists()'))) {
    const impl = _.first(fhirpath.evaluate(metadata, 'implementation'));
    console.log(impl);
    result = _.concat(result, {
      url: impl.url,
      description: impl.description,
    });
  }

  if (_.has(options, 'baseUrl')) {
    result = _.concat(result, {
      url: options.baseUrl,
      description: options.description,
    });
  }

  return result;
};
