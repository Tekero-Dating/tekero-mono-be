import request from 'supertest';
import { closeApp, getApp } from './helpers/get-app';
import { JwtAuthGuard } from '../src/utils/jwt.auth-guard';
import { QuestionnaireController } from '../src/modules/questionnaire-module/questionnaire.controller';
import { GendersEnum } from '../src/contracts/db/models/enums';

jest
  .spyOn(JwtAuthGuard.prototype, 'canActivate')
  .mockImplementation(() => true);

describe('Test suite for questionnaire of Tekero', () => {
  let App;
  let questionnaireController: QuestionnaireController;
  beforeAll(async () => {
    App = await getApp();
    questionnaireController = App.get(QuestionnaireController);
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('User first time opens the app and completes whole questionnaire step by step', () => {
    it('Confirm that users has correct state of questionnaire', async () => {
      const qUser1 = await questionnaireController.getQuestionnaire(
        { userId: 1 },
        null as any,
      );
      const qUser4 = await questionnaireController.getQuestionnaire(
        { userId: 4 },
        null as any,
      );

      expect(qUser1.result!.started).toBe(false);
      expect(qUser4.result!.started).toBe(true);
    });

    it('Submit questionnaire step successfully', async () => {
      const qUser1 = await questionnaireController.getQuestionnaire(
        { userId: 1 },
        null as any,
      );
      await questionnaireController.submitQuestionByShortcode(
        {
          userId: 1,
          response: {
            shortcode: 'sex',
            response: GendersEnum.MALE,
          },
        },
        null as any,
      );

      const qUser1AfterSubmit = await questionnaireController.getQuestionnaire(
        { userId: 1 },
        null as any,
      );
      expect(qUser1.result!.started).toBe(false);
      expect(qUser1AfterSubmit.result!.started).toBe(true);
    });

    it('Submit questionnaire step by step successfully and complete', async () => {
      const qUser2 = await questionnaireController.getQuestionnaire(
        { userId: 2 },
        null as any,
      );
      const { questions } = qUser2.result!;
      for await (const question of questions!) {
        const { question: q } = question;
        let answer;
        if (q.type === 'string') {
          answer = 'MALE';
        } else if (q.type === 'number') {
          answer = 5;
        } else if (q.type === 'boolean') {
          answer = true;
        }
        await questionnaireController.submitQuestionByShortcode(
          {
            userId: 2,
            response: {
              shortcode: q.shortcode,
              response: answer,
            },
          },
          null as any,
        );
      }
      const qUser2AfterSubmit = await questionnaireController.getQuestionnaire(
        { userId: 2 },
        null as any,
      );
      expect(qUser2.result!.completed).toBe(false);
      expect(qUser2AfterSubmit.result!.completed).toBe(true);
    });
  });

  describe('User opens the app and complete questionnaire partially, then return to complete other steps', () => {
    it('Submit questionnaire remaining steps successfully', async () => {
      const qUser2 = await questionnaireController.getQuestionnaire(
        { userId: 2 },
        null as any,
      );
      const { questions } = qUser2.result!;
      const middleQuestionOfQuestionnaireIndex =
        Math.floor(questions!.length / 2) === 0
          ? 0
          : Math.floor(questions!.length / 2) - 1;
      const middleQuestion = questions![middleQuestionOfQuestionnaireIndex];
      let middleQuestionAnswer;
      if (middleQuestion.question.type === 'string') {
        middleQuestionAnswer = 'FEMALE';
      } else if (middleQuestion.question.type === 'number') {
        middleQuestionAnswer = 6;
      } else if (middleQuestion.question.type === 'boolean') {
        middleQuestionAnswer = false;
      }
      await questionnaireController.submitQuestionByShortcode(
        {
          userId: 2,
          response: {
            shortcode: middleQuestion.question.shortcode,
            response: middleQuestionAnswer,
          },
        },
        null as any,
      );

      const qUser2AfterSubmitPart =
        await questionnaireController.getQuestionnaire(
          { userId: 2 },
          null as any,
        );
      expect(middleQuestion.answered).toBe(true);
      expect(
        qUser2AfterSubmitPart.result!.questions![
          middleQuestionOfQuestionnaireIndex
        ].response,
      ).not.toEqual(middleQuestion.response);
      expect(
        qUser2AfterSubmitPart.result!.questions![
          middleQuestionOfQuestionnaireIndex
        ].response,
      ).toEqual(middleQuestionAnswer);
      expect(qUser2AfterSubmitPart.result!.started).toEqual(true);
    });
  });

  describe('Negative cases', () => {
    it('User try to submit incorrect data and receives bad data error from server', () => {});
  });
});
