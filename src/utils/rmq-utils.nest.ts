import {
  ClientsModule,
  ClientProxy,
  ClientProxyFactory,
  RmqOptions,
  RmqRecordBuilder,
  Transport,
} from '@nestjs/microservices';
import { generalRmqOpts, RMQ_QUEUE_PREFIX } from '../config/config';
import {
  AmqplibQueueOptions,
  RmqUrl,
} from '@nestjs/microservices/external/rmq-url.interface';
import { wait } from './wait';
import {
  Module,
  DynamicModule,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';

export const generateRmqOptions = (
  queues: string[] = [],
  serviceName?: string,
  extraOptions?: Record<string, unknown>,
): {
  name: string;
  transport: Transport.RMQ;
  options: {
    urls?: RmqUrl[] | string[];
    queue: string;
    queueOptions?: Record<string, unknown>;
  };
}[] => {
  if (!queues.length) {
    throw new Error(`Queues aren't specified for ${serviceName}.`);
  }
  return queues.map((queue) => ({
    ...generalRmqOpts,
    name: serviceName || 'no-name',
    options: {
      urls: generalRmqOpts.options?.urls,
      queue: `${RMQ_QUEUE_PREFIX}${queue}`,
      ...extraOptions,
    },
  }));
};

const connectToRMQWithRetry = async (
  app,
  queue,
  rmqOpts,
  retries = 5,
  delayMs = 5000,
) => {
  try {
    console.log(
      `Trying to connect to queue ${queue}. Retries left: ${retries}`,
    );
    return await app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        ...rmqOpts.options,
        queue: `${RMQ_QUEUE_PREFIX}${queue}`,
      },
    });
  } catch (err) {
    if (retries === 0) {
      console.error(
        `Failed to connect to RabbitMQ queue ${queue} after multiple attempts.`,
      );
      throw err;
    }
    console.log(
      `Failed to connect to queue ${queue}. Retrying in ${delayMs / 1000} seconds...`,
    );
    await wait(delayMs);
    return connectToRMQWithRetry(app, queue, rmqOpts, retries - 1, delayMs);
  }
};

export const createRmqMicroservices = async (app, queues, rmqOpts) => {
  return await Promise.all(
    queues.map(async (queue) => {
      return connectToRMQWithRetry(app, queue, rmqOpts);
    }),
  );
};

export const rmqSend = async <DataToSend, ResponseData>(
  client: ClientProxy,
  messagePattern: string,
  dataToSend: DataToSend,
  handler: (data: any) => void,
) => {
  const rmqRecord = new RmqRecordBuilder(dataToSend)
    .setOptions({
      headers: {
        ['x-version']: '1.0.0',
      },
      expiration: 30000,
    })
    .build();

  try {
    const response = await firstValueFrom(
      client.send<ResponseData>(messagePattern, rmqRecord).pipe(timeout(5000)),
    );
    handler(response);
  } catch (err) {
    console.error('rmqSend error:', err);
    handler({ success: false, error: err });
  }
};
