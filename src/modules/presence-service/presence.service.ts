import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import RedisLib from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../../config/config';

@Injectable()
export class PresenceService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new RedisLib({
      host: REDIS_HOST || 'localhost',
      port: REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379,
    });
  }

  async setOnline(userId: number, clientId: string, ttl = 300): Promise<void> {
    await this.redisClient.set(`online:user:${userId}`, clientId, 'EX', ttl);
    console.log(`✅ User ${userId} is now online (Client: ${clientId})`);
  }

  async removeOnline(userId: number): Promise<void> {
    const deleted = await this.redisClient.del(`online:user:${userId}`);
    if (deleted) {
      console.log(`❌ User ${userId} is now offline`);
    } else {
      console.log(`⚠️ User ${userId} was not online`);
    }
  }

  async isOnline(userId: number): Promise<boolean> {
    const list = await this.redisListOnlineUsers();
    console.log({ list });
    const result = await this.redisClient.get(`online:user:${userId}`);
    const online = result !== null;
    console.log(`📡 User ${userId} online status: ${online}`);
    return online;
  }

  async redisListOnlineUsers(): Promise<number[]> {
    const keys = await this.redisClient.keys('online:user:*'); // Get all presence keys
    const userIds = keys.map((key) => parseInt(key.split(':').pop() || '0', 10)).filter((id) => !isNaN(id));

    console.log('👥 Online Users:', userIds);
    return userIds;
  }

}
