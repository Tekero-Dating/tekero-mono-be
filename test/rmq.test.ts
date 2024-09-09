import {
  ClientProxy,
  ClientsModule,
  MessagePattern,
  Payload,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';
import { rmqUrl } from '../src/config/config';
import { Controller, INestApplication, Inject, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createRmqMicroservices, generateRmqOptions, rmqSend } from '../src/utils/rmq-utils.nest';
import { wait } from '../src/utils/wait';

describe('RMQ', () => {
  @Controller()
  class PublisherController<T> {
    constructor (
      @Inject('test-service') private client: ClientProxy
    ) {}

    successCount: number = 0;

    async onApplicationBootstrap() {
      await this.client.connect();
    }

    async sendTestMessage() {
      await rmqSend(
        this.client,
        'test-message',
        'test message 1',
        (response) => {
          response.success && this.successCount++;
        }
      );
    }

    async sendWrongMessage() {
      return await rmqSend(
        this.client,
        'test-wrong-message',
        'wrong message 1',
        (response) => {
          response.success && this.successCount++;
        }
      );
    }
  };

  @Controller()
  class ConsumerController<T> {
    constructor (
      @Inject('test-service') private client: ClientProxy
    ) {}

    messagesCount: number = 0;

    async onApplicationBootstrap() {
      await this.client.connect();
    }

    @MessagePattern('test-message')
    async receiveTestMessage(@Payload() data) {
      this.messagesCount++;
      return Promise.resolve({ success: true });
    }
  };

  @Module({
    imports: [
      ClientsModule.register(
        generateRmqOptions(['test'], 'test-service')
      )
    ],
    controllers: [ ConsumerController, PublisherController ]
  })
  class TestModule {}

  const clientRmqConfig: RmqOptions = {
    transport: Transport.RMQ,
    options: {
      "queue": 'test',
      "urls": [rmqUrl!],
      "queueOptions": {
        "durable": true,
        "noAck": false,
        "persistent": true
      }
    }
  };

  let app: INestApplication,
      consumerController: ConsumerController<{"index": number}>,
      publisherController: PublisherController<any>

  beforeAll(async () => {
    app = await NestFactory.create(TestModule);
    await createRmqMicroservices(app, ['test'], clientRmqConfig);
    await app.startAllMicroservices();
    await app.listen(3005);
    consumerController = app.get(ConsumerController);
    publisherController = app.get(PublisherController);
  });
  afterAll(async () => {
    await app.close();
  })

  afterEach(() => {
    consumerController.messagesCount = 0;
    publisherController.successCount = 0;
  })

  it('Consumer and publisher connected to the queue and exchanging messages', async () => {
    publisherController.sendTestMessage();
    publisherController.sendTestMessage();
    publisherController.sendTestMessage();
    await wait(200);
    expect(publisherController.successCount).toEqual(3);
    expect(consumerController.messagesCount).toEqual(3);
  });

  it(`Consumer don't consumes amessages with wrong message pattern`, async () => {
    await publisherController.sendWrongMessage();
    expect(publisherController.successCount).toEqual(0);
  });
});


