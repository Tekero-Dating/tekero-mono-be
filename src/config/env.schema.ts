import type { JTDSchemaType } from 'ajv/dist/jtd';

export interface EnvSchema {
  DB_DRIVER: 'postgres';
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  RMQ_URL: string;
  RMQ_QUEUE_PREFIX: string;
  APP_MODE?: 'dev' | 'stage' | 'prod' | 'test';
  APP_PORT: string;
  AWS_S3_BUCKET: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_KEY: string;
  AWS_REGION: string;
};

export const envSchema: JTDSchemaType<EnvSchema> = {
  properties: {
    DB_DRIVER: { enum: ['postgres'] },
    DB_NAME: { type: 'string' },
    DB_HOST: { type: 'string' },
    DB_PORT: { type: 'string' },
    DB_USERNAME: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    RMQ_URL: { type: 'string' },
    RMQ_QUEUE_PREFIX: { type: 'string' },
    APP_PORT: { type: 'string' },
    AWS_S3_BUCKET: { type: 'string' },
    AWS_ACCESS_KEY: { type: 'string' },
    AWS_SECRET_KEY: { type: 'string' },
    AWS_REGION: { type: 'string' }
  },
  optionalProperties: {
    APP_MODE: { enum: ['dev', 'stage', 'prod', 'test'] }
  },
  additionalProperties: true
};
