import { Module } from '@nestjs/common';
import * as amqp from 'amqplib';
import { RmqService } from './rmq.service';
import { rmqUrl } from '../../config/config';

@Module({
  providers: [
    {
      provide: 'AMQP_CONNECTION',
      useFactory: async () => {
        const connection = await amqp.connect(rmqUrl);
        return connection;
      },
    },
    RmqService,
  ],
  exports: ['AMQP_CONNECTION', RmqService],
})
export class RmqModule {}
