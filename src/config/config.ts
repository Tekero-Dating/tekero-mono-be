import * as dotenv from 'dotenv';
import { Transport, RmqOptions } from '@nestjs/microservices';
import { envSchema } from './env.schema';
import type { EnvSchema } from './env.schema';
import Ajv from 'ajv/dist/jtd';
import { DB_MODELS, MODELS_REPOSITORIES_ENUM } from '../contracts/db/models/models.enum';
import { RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';
import { Dialect } from 'sequelize';
import { User } from '../contracts/db/models/user.entity';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
})
const ajv = new Ajv()

const {
  DB_DRIVER,
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  RMQ_URL,
  APP_MODE,
  APP_PORT,
  RMQ_QUEUE_PREFIX
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
  models: DB_MODELS
};

interface IRmqOptions extends RmqOptions {
  transport: Transport.RMQ;
}
export const generalRmqOpts: IRmqOptions = {
  transport: Transport.RMQ,
  options: {
    queue: 'general_queue',
    urls: [RMQ_URL! as RmqUrl] as RmqUrl[],
    noAck: false,
    persistent: true
  }
};

export const rmqUrl = RMQ_URL;
export { APP_PORT, RMQ_QUEUE_PREFIX }
