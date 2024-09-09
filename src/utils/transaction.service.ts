import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class TransactionService {
  constructor(private readonly sequelize: Sequelize) {}

  async runTransaction(callback: (t: any) => Promise<any>): Promise<any> {
    const t = await this.sequelize.transaction();
    try {
      const result = await callback(t);
      await t.commit();
      return result;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
