import { AllowNull, Column, Table, Unique } from 'sequelize-typescript';
import { Model } from 'sequelize-typescript';

@Table({ modelName: 'actions-list' })
export class ActionsList extends Model {
  @AllowNull(false)
  @Unique
  @Column
  actionType: string;

  @Column
  price: number;

  @AllowNull(true)
  @Column
  description: string;
};

export const ActionsListRepository = {
  // TODO: TypeError: Cannot read properties of undefined (reading 'ACTIONS_LIST_REPOSITORY') when using  MODELS_REPOSITORIES_ENUM['ACTIONS_LIST_REPOSITORY']
  provide: 'ACTIONS_LIST_REPOSITORY',
  useValue: ActionsList
}
