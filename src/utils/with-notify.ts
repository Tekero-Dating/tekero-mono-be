import { NotificationTypesEnum } from '../contracts/db/models/enums';
import { rmqSend } from './rmq-utils.nest';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { generalRmqOpts, RMQ_QUEUE_PREFIX } from '../config/config';
import { NOTIFICATIONS_MODULE_QUEUES } from '../contracts/notifications-interface/notifications.constants';

class NotifySingleton {
  private static client: ClientProxy;

  public static getClient(): ClientProxy {
    if (!NotifySingleton.client) {
      NotifySingleton.client = ClientProxyFactory.create({
        ...generalRmqOpts,
        transport: Transport.RMQ,
        options: {
          ...generalRmqOpts.options,
          urls: generalRmqOpts.options?.urls,
          queue: `${RMQ_QUEUE_PREFIX}${NOTIFICATIONS_MODULE_QUEUES[1]}`, // TODO: bad practice,
          noAck: true
        },
      });
    }
    return NotifySingleton.client;
  }
}

export function WithNotify (
  eventName: NotificationTypesEnum
): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const client = NotifySingleton.getClient();
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
      const result = await originalMethod.apply(this, args);
      if (!result.success) {
        return result;
      }
      await rmqSend(
        client, eventName, { ...args, ...result.result },
        ({success, error}) => {
          console.log({ result });
          return success;
        }
      );
      return result;
    };
    return descriptor;
  };
}
