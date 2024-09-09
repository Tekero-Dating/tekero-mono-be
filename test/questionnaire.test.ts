import request from 'supertest';
import { closeApp, getApp } from './helpers/get-app';

describe('Test suite for questionnaire of Tekero', () => {
  let App;

  beforeAll(async () => {
    console.log('BEFORE ALL ! TIME');
    App = await getApp();
  });

  afterAll(async () => {
    await closeApp();
  });

  describe('User first time opens the app and completes whole questionnaire step by step', () => {
    it('Confirm that users has correct state of questionnaire', async () => {
      const qUser1 = await request(App.getHttpServer())
        .get('/api/questionnaire/1').expect(200);
      const qUser4 = await request(App.getHttpServer())
        .get('/api/questionnaire/4').expect(200);
      const qUser5 = await request(App.getHttpServer())
        .get('/api/questionnaire/5').expect(404);

      expect(qUser1.body.started).toBe(false);
      expect(qUser4.body.started).toBe(true);
    })
    it('Submit questionnaire step successfully', () => {

    });
    it('Submit questionnaire step by step successfully and complete', () => {

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
