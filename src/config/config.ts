import * as dotenv from 'dotenv';
import { Transport, RmqOptions } from '@nestjs/microservices';
import { envSchema } from './env.schema';
import type { EnvSchema } from './env.schema';
import Ajv from 'ajv/dist/jtd';
import { DB_MODELS } from '../contracts/db/models/models.enum';
import { RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});
const ajv = new Ajv();

const {
  DB_DRIVER,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  RMQ_URL,
  APP_PORT,
  RMQ_QUEUE_PREFIX,
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_REGION,
  SALT,
  JWT_SECRET,
  JWT_TOKEN_TTL,
  JWT_REFRESH_TOKEN_TTL,
  REDIS_HOST,
  REDIS_PORT,
} = process.env;

const validate = ajv.compile<EnvSchema>(envSchema);

if (validate(process.env)) {
  console.log('Env are valid according to schema');
} else {
  console.log(ajv.errorsText(validate.errors));
}

export const dbOpts = {
  driver: DB_DRIVER! as 'postgres',
  host: DB_HOST!,
  port: +DB_PORT!,
  username: DB_USERNAME!,
  password: DB_PASSWORD!,
  database: DB_NAME!,
  models: DB_MODELS,
};

interface IRmqOptions extends RmqOptions {
  transport: Transport.RMQ;
}
export const generalRmqOpts: IRmqOptions = {
  transport: Transport.RMQ,
  options: {
    queue: 'general_queue',
    urls: [RMQ_URL! as RmqUrl] as RmqUrl[],
    noAck: true,
    persistent: true,
    queueOptions: {
      durable: true,
    },
  },
};

export const rmqUrl = RMQ_URL;
export {
  APP_PORT,
  RMQ_QUEUE_PREFIX,
  AWS_S3_BUCKET,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  AWS_REGION,
  SALT,
  JWT_SECRET,
  JWT_TOKEN_TTL,
  JWT_REFRESH_TOKEN_TTL,
  REDIS_HOST,
  REDIS_PORT,
};
