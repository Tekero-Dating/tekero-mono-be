import request from 'supertest';
import { closeApp, getApp } from './helpers/get-app';
import { JwtAuthGuard } from '../src/utils/jwt.auth-guard';
import { QuestionnaireController } from '../src/modules/questionnaire-module/questionnaire.controller';
import { GendersEnum } from '../src/contracts/db/models/enums';
import { QuestionnaireSteps } from '../src/contracts/db/models/questionnaire-steps.entity';

jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockImplementation(() => true);

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
        null as any
      );
      const qUser4 = await questionnaireController.getQuestionnaire(
        { userId: 4 },
        null as any
      );

      expect(qUser1.result!.started).toBe(false);
      expect(qUser4.result!.started).toBe(true);
    })

    it('Submit questionnaire step successfully', async () => {
      const qUser1 = await questionnaireController.getQuestionnaire(
        { userId: 1 },
        null as any
      );
      await questionnaireController.submitQuestionByShortcode({
        userId: 1,
        response: {
          shortcode: 'sex',
          response: GendersEnum.MALE
        }
      }, null as any);

      const qUser1AfterSubmit = await questionnaireController.getQuestionnaire(
        { userId: 1 },
        null as any
      );
      expect(qUser1.result!.started).toBe(false);
      expect(qUser1AfterSubmit.result!.started).toBe(true);
    });

    it('Submit questionnaire step by step successfully and complete', async () => {
      const qUser2 = await questionnaireController.getQuestionnaire(
        { userId: 2 },
        null as any
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
        } else if (q.type === 'array') {
          answer = ['a', 'b', 'c'];
        } else if (q.type === 'location') {
          answer = {
            "type": "Point", "coordinates": [2.186015, 41.388123]
          };
        }
        await questionnaireController.submitQuestionByShortcode({
          userId: 2,
          response: {
            shortcode: q.shortcode,
            response: answer
          }
        }, null as any);
      }
      const qUser2AfterSubmit = await questionnaireController.getQuestionnaire(
        { userId: 2 },
        null as any
      );
      expect(qUser2.result!.completed).toBe(false);
      expect(qUser2AfterSubmit.result!.completed).toBe(true);
    }, 15000);
  });
});
