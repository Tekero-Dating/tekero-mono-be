import request from 'supertest';
import { closeApp, getApp } from './helpers/get-app';
import * as bodyParser from 'body-parser';

describe('Test suite for questionnaire of Tekero', () => {
  let App;

  beforeAll(async () => {
    App = await getApp();
    App.use(bodyParser.json())
  });

  afterAll(async () => {
    await closeApp();
  });

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
        console.log('test', { type: q.type });
        if (q.type === 'string') {
          console.log('type string');
          answer = 'MALE';
          console.log({ answer });
        } else if (q.type === 'number') {
          console.log('type number');
          answer = 5;
          console.log({ answer });
        } else if (q.type === 'boolean') {
          console.log('type bool');
          answer = true;
          console.log({ answer });
        }
        console.log('TEST', {
          shortcode: q.shortcode,
          response: answer
        });
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
    it('Submit questionnaire remaining steps successfully', () => {

    });
  });

  describe('User continue completing the questionnaire but then want to edit some of his answers from prev steps', () => {
    it('Submit questionnaire step tnen back to prev step and then complete 2 steps, then go 1 step back and submit successfully', () => {

    });
  });

  describe('Negative cases', () => {
    it('User try to submit incorrect data and receives bad data error from server', () => {

    });

    it('User try to submit over 1 step of questionnaire and receives not allowed error from server', () => {

    });
  })
});
