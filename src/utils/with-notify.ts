import { NotificationTypesEnum } from '../contracts/db/models/enums';
import { rmqSend } from './rmq-utils.nest';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { generalRmqOpts, RMQ_QUEUE_PREFIX } from '../config/config';
import { NOTIFICATIONS_MODULE_QUEUES } from '../contracts/notifications-interface/notifications.constants';

export class NotifySingleton {
  private static client: ClientProxy | undefined;

  public static getClient(): ClientProxy {
    if (!NotifySingleton.client) {
      NotifySingleton.client = ClientProxyFactory.create({
        ...generalRmqOpts,
        options: {
          ...generalRmqOpts.options,
          urls: generalRmqOpts.options?.urls,
          queue: `${RMQ_QUEUE_PREFIX}${NOTIFICATIONS_MODULE_QUEUES[1]}`, // TODO: bad practice,
        },
      });
    }
    return NotifySingleton.client;
  }

  public static async shutdown(): Promise<void> {
    if (NotifySingleton.client) {
      await NotifySingleton.client.close();
      NotifySingleton.client = undefined;
    }
  }
}

export function WithNotify(eventName: NotificationTypesEnum): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const client = NotifySingleton.getClient();
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      if (!result.success) {
        return result;
      }
      await rmqSend(
        client,
        eventName,
        { ...args, ...result.result },
        ({ success, error }) => {},
      );
      return result;
    };
  };
}
