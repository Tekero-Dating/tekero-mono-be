import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Questionnaire } from '../../contracts/db/models/questionnaire.entity';
import { QuestionnaireSteps } from '../../contracts/db/models/questionnaire-steps.entity';
import {
  IGetQuestionnaire,
  ISubmitQuestionByShortcode,
} from '../../contracts/questionnaire-interface/questionnaire.api-interface';

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

    if (
      result.questions
        .filter(q => q.answered === true).length === result.questions.length
    ) {
      result.completed = true;
    }

    return result;
  }

  async submitQuestionByShortcode(
    userId: number,
    response: ISubmitQuestionByShortcode.Request['response']
  ) {
    const { shortcode, response: answer  } = response;
    const questionnaireStep = await this.questionnaireStepsRepository
      .findOne({
        where: { 'question.shortcode': shortcode }
      });

    if (!questionnaireStep) {
      throw new NotFoundException('Question with given shortcode not found');
    }

    const { active, question } = questionnaireStep;
    if (!active) {
      throw new BadRequestException('Trying to submit response to inactive question');
    } else if (question.type !== typeof answer) {
      throw new BadRequestException('Response provided in wrong format');
    }

    let usersQuestionnaire: Questionnaire;
    try {
      usersQuestionnaire = await this.questionnaireRepository
        .findOne<Questionnaire>({
          where: { user_id: userId },
          rejectOnEmpty: true
        });
    } catch (_e) {
      throw new NotFoundException('Can not find the users questionnaire');
    }
    let updated = await this.questionnaireRepository.update(
      {
        responses: {
          ...usersQuestionnaire.responses,
          ...{ [shortcode]: answer },
        },
        ...(!Object.keys(usersQuestionnaire.responses).length ? { questionnaire_started: true } : {})
      },
      {
        where: { id: usersQuestionnaire.id },
        returning: true
      }
    );

    const totalActiveQuestions = await this.questionnaireStepsRepository
      .findAll({ where: { active: true } });

    if (
      updated[0] && Object.keys(usersQuestionnaire.responses).length + 1 === totalActiveQuestions.length
    ) {
      updated = await this.questionnaireRepository.update({
        is_completed: true
      } as Questionnaire, {
        where: { id: usersQuestionnaire.id },
        returning: true
      });
    }
    return updated[1][0];
  }
}
