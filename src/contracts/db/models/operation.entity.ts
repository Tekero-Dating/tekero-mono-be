import { AllowNull, BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './user.entity';
import { ActionsList } from './actions-list.entity';

@Table({ modelName: 'operation' })
export class Operation extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;

  @BelongsTo(() => User, { foreignKeyConstraint: true })
  user!: User;

  @ForeignKey(() => ActionsList)
  @AllowNull(false)
  @Column
  action_id!: number;

  @BelongsTo(() => ActionsList, { foreignKeyConstraint: true })
  action!: ActionsList;

  @AllowNull(false)
  @Column
  spent: number;

  @AllowNull(false)
  @Column
  balanceBeforeOperation: number;

  @AllowNull(false)
  @Column
  balanceAfterOperation: number;

  @Column
  sideNote: string;
}

export const OperationsRepository = {
  provide: 'OPERATIONS_REPOSITORY',
  useValue: Operation
};
