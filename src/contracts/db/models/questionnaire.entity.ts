import {
  Table,
  Column,
  Model,
  BelongsTo,
  DataType,
  ForeignKey,
  AllowNull,
} from 'sequelize-typescript';
import { User } from './user.entity';
import { validateResponse } from './validators/questionnaire.validator';

@Table({ modelName: 'questionnaire' })
export class Questionnaire extends Model {
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  user_id!: number;
  @BelongsTo(() => User)
  questionnaire_owner!: User;

  @Column
  questionnaire_started: boolean;

  @Column
  is_completed: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
    validate: {
      async validateJSON(value: any) {
        const valid = validateResponse(value);
        if (!valid) {
          throw new Error(
            `Invalid response format: ${JSON.stringify(validateResponse.errors)}`,
          );
        }
      },
    },
  })
  responses!: Record<string, string | number | boolean>;
}

export const QuestionnaireRepository = {
  //  TypeError: Cannot read properties of undefined (reading 'QUESTIONNAIRE_REPOSITORY') when using  MODELS_REPOSITORIES_ENUM['QUESTIONNAIRE_REPOSITORY']
  provide: 'QUESTIONNAIRE_REPOSITORY',
  useValue: Questionnaire,
};
