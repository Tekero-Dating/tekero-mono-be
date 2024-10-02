import request from 'supertest';
import { closeApp, getApp } from './helpers/get-app';
import * as bodyParser from 'body-parser';
import { wait } from '../src/utils/wait';

describe('Test suite for questionnaire of Tekero', () => {
  let App;
  beforeAll(async () => {
    App = await getApp();
  });

  afterAll(async () => {});

  describe('User first time opens the app and completes whole questionnaire step by step', () => {
    it('Confirm that users has correct state of questionnaire', async () => {
      const qUser1 = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/1').expect(200);
      const qUser4 = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/4').expect(200);

      expect(qUser1.body.started).toBe(false);
      expect(qUser4.body.started).toBe(true);
    })

    it('Submit questionnaire step successfully', async () => {
      const qUser1 = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/1').expect(200);
      await request(App.getHttpServer())
        .post('/api/questionnaire/submit-question/1')
        .send({
          shortcode: "sex",
          response: "MALE"
        })
        .expect(200);
      const qUser1AfterSubmit = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/1').expect(200);
      expect(qUser1.body.started).toBe(false);
      expect(qUser1AfterSubmit.body.started).toBe(true);
    });

    it('Submit questionnaire step by step successfully and complete', async () => {
      const qUser2 = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/2').expect(200);
      const { questions } = qUser2.body;
      for await (const question of questions) {
        const { question: q } = question;
        let answer;
        if (q.type === 'string') {
          answer = 'MALE';
        } else if (q.type === 'number') {
          answer = 5;
        } else if (q.type === 'boolean') {
          answer = true;
        }
        await request(App.getHttpServer())
          .post('/api/questionnaire/submit-question/2')
          .send({
            shortcode: q.shortcode,
            response: answer
          })
          .expect(200);
      }
      const qUser2AfterSubmit = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/2').expect(200);
      expect(qUser2.body.completed).toBe(false);
      expect(qUser2AfterSubmit.body.completed).toBe(true);
    });
  });

  describe('User opens the app and complete questionnaire partially, then return to complete other steps', () => {
    it('Submit questionnaire remaining steps successfully', async () => {
      const qUser2 = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/2').expect(200);
      const { questions } = qUser2.body;
      const middleQuestionOfQuestionnaireIndex =
        Math.floor(questions.length / 2) === 0
          ? 0
          : Math.floor(questions.length / 2) - 1
      const middleQuestion = questions[middleQuestionOfQuestionnaireIndex];
      let middleQuestionAnswer;
      if (middleQuestion.question.type === 'string') {
        middleQuestionAnswer = 'FEMALE';
      } else if (middleQuestion.question.type === 'number') {
        middleQuestionAnswer = 6;
      } else if (middleQuestion.question.type === 'boolean') {
        middleQuestionAnswer = false;
      }
      console.log({ middleQuestion, middleQuestionAnswer, middleQuestionOfQuestionnaireIndex, questions });
      await request(App.getHttpServer())
        .post('/api/questionnaire/submit-question/2')
        .send({
          shortcode: middleQuestion.question.shortcode,
          response: middleQuestionAnswer
        })
        .expect(200);
      const qUser2AfterSubmitPart = await request(App.getHttpServer())
        .get('/api/questionnaire/get-questionnaire/2').expect(200);
      expect(middleQuestion.answered).toBe(true);
      expect(qUser2AfterSubmitPart.body
        .questions[middleQuestionOfQuestionnaireIndex].response
      ).not.toEqual(middleQuestion.question.response);
      expect(qUser2AfterSubmitPart.body
        .questions[middleQuestionOfQuestionnaireIndex].response
      ).toEqual(middleQuestionAnswer);
      expect(qUser2AfterSubmitPart.body.started).toEqual(true);
    });
  });

  describe('Negative cases', () => {
    it('User try to submit incorrect data and receives bad data error from server', () => {

    });
  })
});
