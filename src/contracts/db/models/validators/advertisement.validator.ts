import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Advertisement } from '../advertisements.entity';

const ajv = new Ajv({ $data: true });
addFormats(ajv);

const filterSchema: JSONSchemaType<Advertisement["filter"]> = {
  type: "object",
  properties: {
    gender: { type: "array", items: { type: "string" } },
    distance: { type: "number" },
    constitution: { type: "array", items: { type: "string" } },
    genderExpressionFrom: { type: "number" },
    genderExpressionTo: { type: "number" },
    orientationFrom: { type: "number" },
    orientationTo: { type: "number" },
    ageFrom: { type: "number" },
    ageTo: { type: "number" },
    heightFrom: { type: "number" },
    heightTo: { type: "number" },
  },
  additionalProperties: false,
  required: [
    "gender",
    "distance",
    "constitution",
    "genderExpressionFrom",
    "genderExpressionTo",
    "orientationFrom",
    "orientationTo",
    "ageFrom",
    "ageTo",
    "heightFrom",
    "heightTo"
  ],
  allOf: [
    {
      if: {
        properties: {
          heightFrom: { type: "number" },
          heightTo: { type: "number" }
        },
      },
      then: {
        properties: {
          heightTo: { type: "number", minimum: { $data: "1/heightFrom" } }
        }
      }
    },
    {
      if: {
        properties: {
          ageFrom: { type: "number" },
          ageTo: { type: "number" }
        },
      },
      then: {
        properties: {
          ageTo: { type: "number", minimum: { $data: "1/ageFrom" } }
        }
      }
    },
    {
      if: {
        properties: {
          orientationFrom: { type: "number" },
          orientationTo: { type: "number" }
        },
      },
      then: {
        properties: {
          orientationTo: { type: "number", minimum: { $data: "1/orientationFrom" } }
        }
      }
    },
    {
      if: {
        properties: {
          genderExpressionFrom: { type: "number" },
          genderExpressionTo: { type: "number" }
        },
      },
      then: {
        properties: {
          genderExpressionTo: { type: "number", minimum: { $data: "1/genderExpressionFrom" } }
        }
      }
    }
  ]
};


export const validateAdvFilter = ajv.compile(filterSchema);
