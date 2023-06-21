# FHIR OpenApi Generator

This is an (incomplete) node library that converts a FHIR CapabilityStatement into
OpenAPI definitions. This is useful because once you have an OpenAPI
file, you can use all the tooling avaialble for OpenAPI for your FHIR
server.

## Library usage

```
const FHIRClient = require('fhir-kit-client');
// const {generate} = require('fhir-open-api-generator`);

const client = new FHIRClient({baseUrl: 'http://hapi.fhir.org/baseR4'});

(async function() {
  const capabilityStatement = await client.capabilityStatement();
  console.log(JSON.stringify(capabilityStatement, null, 2))
  return generate(client.metadata); // result will be an OpenAPI definition
})().then(console.log).catch(console.error);

```

You would likely want to use this in combination with something like the
[swagger-ui-express](https://github.com/scottie1984/swagger-ui-express) package.

## Command line usage

TBD

## Limitations and assumptions

1. For now we render the capability statement for JSON only.
2. Currently only FHIR R4 is supported
