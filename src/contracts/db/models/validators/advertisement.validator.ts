import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { Advertisement } from '../advertisements.entity';

const ajv = new Ajv({ $data: true });
addFormats(ajv);

const filterSchema: JSONSchemaType<Advertisement['filter']> = {
  type: 'object',
  properties: {
    gender: { type: 'array', items: { type: 'string' }, nullable: true },
    distance: { type: 'number', nullable: true },
    constitution: { type: 'array', items: { type: 'string' }, nullable: true },
    genderExpressionFrom: { type: 'number', nullable: true },
    genderExpressionTo: { type: 'number', nullable: true },
    orientationFrom: { type: 'number', nullable: true },
    orientationTo: { type: 'number', nullable: true },
    ageFrom: { type: 'number', nullable: true },
    ageTo: { type: 'number', nullable: true },
    heightFrom: { type: 'number', nullable: true },
    heightTo: { type: 'number', nullable: true },
  },
  additionalProperties: false,
  allOf: [
    {
      if: {
        properties: {
          heightFrom: { type: 'number' },
          heightTo: { type: 'number' },
        },
      },
      then: {
        properties: {
          heightTo: { type: 'number', minimum: { $data: '1/heightFrom' } },
        },
      },
    },
    {
      if: {
        properties: {
          ageFrom: { type: 'number' },
          ageTo: { type: 'number' },
        },
      },
      then: {
        properties: {
          ageTo: { type: 'number', minimum: { $data: '1/ageFrom' } },
        },
      },
    },
    {
      if: {
        properties: {
          orientationFrom: { type: 'number' },
          orientationTo: { type: 'number' },
        },
      },
      then: {
        properties: {
          orientationTo: {
            type: 'number',
            minimum: { $data: '1/orientationFrom' },
          },
        },
      },
    },
    {
      if: {
        properties: {
          genderExpressionFrom: { type: 'number' },
          genderExpressionTo: { type: 'number' },
        },
      },
      then: {
        properties: {
          genderExpressionTo: {
            type: 'number',
            minimum: { $data: '1/genderExpressionFrom' },
          },
        },
      },
    },
  ],
};

export const validateAdvFilter = ajv.compile(filterSchema);
