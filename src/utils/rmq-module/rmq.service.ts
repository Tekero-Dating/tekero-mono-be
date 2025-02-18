import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RmqService implements OnApplicationShutdown {
  private readonly logger = new Logger(RmqService.name);
  private channel: amqp.Channel;
  constructor(
    @Inject('AMQP_CONNECTION') private readonly connection: amqp.Connection
  ) {}


  async initChannel() {
    if (!this.channel) {
      this.channel = await this.connection.createChannel();
    }
  }

  async publish(queue: string, message: any) {
    await this.initChannel();
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    this.logger.log(`📤 Message sent to ${queue}:`, message);
  }

  async consume(queue: string, callback: (msg: amqp.ConsumeMessage) => void) {
    await this.initChannel();
    await this.channel.assertQueue(queue, { durable: true });

    this.channel.consume(queue, (msg) => {
      if (msg) {
        try {
          callback(msg);
          this.channel.ack(msg);
        } catch (error) {
          console.error('❌ Error processing message:', error);
          this.channel.nack(msg, false, false); // Reject message
        }
      }
    });
  }

  async onApplicationShutdown() {
    try {
      if (this.channel && this.channel.close) {
        console.log('Closing channel...');
        await this.channel.close();
      }
      if (this.connection && this.connection.close) {
        console.log('Closing connection...');
        await this.connection.close();
      }
    } catch (error) {
      console.error('Error closing RabbitMQ:', error.message);
    }
  }
}
