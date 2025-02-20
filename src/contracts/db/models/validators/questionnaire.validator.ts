import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { IQuestion } from '../questionnaire-steps.entity';

const ajv = new Ajv();
addFormats(ajv);

const questionSchema: JSONSchemaType<IQuestion> = {
  type: 'object',
  properties: {
    shortcode: { type: 'string' },
    question: { type: 'string' },
    languages: {
      type: 'object',
      additionalProperties: { type: 'string' },
      required: [],
    },
    affected_property: { type: 'string' },
    type: { type: 'string' },
  },
  required: ['shortcode', 'question', 'languages', 'affected_property', 'type'],
  additionalProperties: false,
};

const responseSchema: JSONSchemaType<
  Record<string, string | number | boolean>
> = {
  type: 'object',
  additionalProperties: {
    oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
  },
  required: [],
};

export const validateQuestion = ajv.compile(questionSchema);
export const validateResponse = ajv.compile(responseSchema);
