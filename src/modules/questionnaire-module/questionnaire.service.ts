import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Questionnaire } from '../../contracts/db/models/questionnaire.entity';
import { QuestionnaireSteps } from '../../contracts/db/models/questionnaire-steps.entity';
import { IGetQuestionnaire } from '../../contracts/questionnaire-interface/questionnaire.api-interface';

@Injectable()
export class QuestionnaireService {
  private readonly logger = new Logger(QuestionnaireService.name);
  constructor (
    @Inject(MODELS_REPOSITORIES_ENUM.QUESTIONNAIRE)
    private readonly questionnaireRepository: typeof Questionnaire,
    @Inject(MODELS_REPOSITORIES_ENUM.QUESTIONNAIRE_STEPS)
    private readonly questionnaireStepsRepository: typeof  QuestionnaireSteps
  ) {}

  async getQuestionnaire(userId: number) {
    this.logger.log(`Lookup for questionnaire for user ${userId}`);
    const [questionnaireStatus, questions] = await Promise.all([
      await this.questionnaireRepository
        .findOne<Questionnaire>({
          where: { user_id: userId }
      }),
      await this.questionnaireStepsRepository
       .findAll()
    ]);

    this.logger.debug({ questions }, { questionnaireStatus });

    if (!questionnaireStatus) {
      this.logger.error(`Status not found for user`, { userId });
      throw new NotFoundException('Given user not found');
    }

    const result: IGetQuestionnaire.Response['result'] = {
      started: false,
      completed: false,
      questions: []
    };

    if (questionnaireStatus.questionnaire_started === false) {
      this.logger.log('Questionnalire not started.', { userId });
      result.questions = questions.map(question => {
        return {
          answered: false,
          question: question.question
        }
      });
      return result;
    }

    this.logger.log('Questionnaire started, dividing answered and not answered', { userId });

    result.started = true;
    const notAnsweredQuestions: QuestionnaireSteps['question'][] = [];
    const answeredQuestions: QuestionnaireSteps['question'][] = []
    questions.forEach(({ question }) => {
      const { shortcode } = question;
      if (!questionnaireStatus.responses[shortcode]) {
        notAnsweredQuestions.push(question);
      } else {
        answeredQuestions.push(question);
      }
    });
    this.logger.log('Questions are divided, returning result', { userId });
    result.questions = [
      ...answeredQuestions.map((question) => ({
        answered: true,
        response: questionnaireStatus.responses[question.shortcode],
        question
      })),
      ...notAnsweredQuestions.map((question ) => ({
        answered: false,
        question
      }))
    ];

    return result;
  }
}
