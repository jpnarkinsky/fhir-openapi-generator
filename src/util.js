const _ = require('lodash');
const fhirpath = require('fhirpath');

module.exports = {
  evaluateOne(resource, path) {
    return _.first(fhirpath.evaluate(resource, path));
  },
};
