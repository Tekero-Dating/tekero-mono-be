import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { validateQuestion } from './validators/questionnaire.validator';

export interface IQuestion {
  shortcode: string;
  question: string;
  languages: Record<string, string>;
  affected_property: string;
  type: string;
}

@Table({ modelName: 'questionnaire-steps' })
export class QuestionnaireSteps extends Model {
  @Column({
    type: DataType.JSONB,
    allowNull: false,
    validate: {
      async validateJSON(value: any) {
        const valid = validateQuestion(value);
        if (!valid) {
          throw new Error(
            `Invalid questions format: ${JSON.stringify(validateQuestion.errors)}`,
          );
        }
      },
    },
  })
  question!: IQuestion;

  @Column
  active: boolean;
}

export const QuestionnaireStepsRepository = {
  //  TypeError: Cannot read properties of undefined (reading 'QUESTIONNAIRE_REPOSITORY') when using  MODELS_REPOSITORIES_ENUM['QUESTIONNAIRE_REPOSITORY']
  provide: 'QUESTIONNAIRE_STEPS_REPOSITORY',
  useValue: QuestionnaireSteps,
};
