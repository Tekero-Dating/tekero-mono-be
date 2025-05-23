import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import RedisLib from 'ioredis';
import { REDIS_HOST, REDIS_PORT } from '../../config/config';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);
  private redisClient: Redis;

  constructor() {
    this.redisClient = new RedisLib({
      host: REDIS_HOST || 'localhost',
      port: REDIS_PORT ? parseInt(REDIS_PORT, 10) : 6379,
    });
  }

  async setOnline(userId: string, clientId: string, ttl = 300): Promise<void> {
    await this.redisClient.set(`online:user:${userId}`, clientId, 'EX', ttl);
    this.logger.log(`✅ User ${userId} is now online (Client: ${clientId})`);
  }

  async removeOnline(userId: string): Promise<void> {
    const deleted = await this.redisClient.del(`online:user:${userId}`);
    if (deleted) {
      this.logger.log(`❌ User ${userId} is now offline`);
    } else {
      this.logger.log(`⚠️ User ${userId} was not online`);
    }
  }

  async isOnline(userId: string): Promise<boolean> {
    const result = await this.redisClient.get(`online:user:${userId}`);
    const online = result !== null;
    this.logger.log(`📡 User ${userId} online status: ${online}`);
    return online;
  }

  async redisListOnlineUsers(): Promise<number[]> {
    const keys = await this.redisClient.keys('online:user:*');
    const userIds = keys
      .map((key) => parseInt(key.split(':').pop() || '0', 10))
      .filter((id) => !isNaN(id));
    this.logger.log('👥 Online Users:', userIds);
    return userIds;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
    this.logger.log('Redis connection closed gracefully.');
  }
}
