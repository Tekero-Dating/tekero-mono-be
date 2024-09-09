import { Injectable } from '@nestjs/common';
import { dbOpts, generalRmqOpts } from './config/config';

@Injectable()
export class AppService {
  getHello(): string {
    console.log({ generalRmqOpts, dbOpts });
    return 'Hello Grinder dating app!';
  }
}
