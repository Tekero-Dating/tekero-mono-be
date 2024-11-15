'use strict';

import { User } from '../src/contracts/db/models/user.entity';
import { Media } from '../src/contracts/db/models/mdeia.entity';
import { Model } from 'sequelize';

import { ConstitutionsEnum, GendersEnum } from '../src/contracts/db/models/enums';
import { UserProfile } from '../src/contracts/db/models/user-profile.entity';
import { Questionnaire } from '../src/contracts/db/models/questionnaire.entity';
import { Sequelize as SEQUELIZE } from 'sequelize-typescript';
import { dbOpts } from '../src/config/config';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const sequelize = new SEQUELIZE({
      dialect: dbOpts.driver,
      ...dbOpts,
    });
    sequelize.addModels(dbOpts.models);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    type OmitSequelizeSpecific<T> = Omit<T, keyof Model>;
    await sequelize.sync(
      // Uncomment if you need to clean up and initialize all DB models from scratch
      { force: true }
    );
    type OmitFunctions<T> = Pick<T, {
      [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T]>;
    type ModelAttributes<T extends Model> = OmitFunctions<OmitSequelizeSpecific<T>>;

    const userSeeds: Omit<ModelAttributes<User>, 'userProfile'>[] = [
      {
        firstName: 'Fedor',
        lastName: 'Emelianenko',
        dob: new Date('1990-05-15'),
        email: 'fedya@test.com',
        validated: false,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        firstName: 'Kira',
        lastName: 'Nightly',
        dob: new Date('2001-05-16'),
        email: 'kira@test.com',
        validated: true,
        balance: 45,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        firstName: 'Daniil',
        lastName: 'Boris',
        dob: new Date('1995-01-11'),
        email: 'danya@test.com',
        validated: true,
        balance: 20,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        firstName: 'Larisa',
        lastName: 'Korvin',
        dob: new Date('2001-04-10'),
        email: 'korvin@test.com',
        validated: false,
        balance: 20,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }];
    await queryInterface.bulkInsert('users', userSeeds);

    const mediaSeeders: ModelAttributes<Media>[] = [
      {
        private: false,
        url: 'image1.url',
        user_id: 4,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        private: true,
        url: 'image2.url',
        user_id: 2,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        private: false,
        url: 'image3.url',
        user_id: 2,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        private: false,
        url: 'image4.url',
        user_id: 1,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        private: false,
        url: 'image5.url',
        user_id: 1,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }];
    await queryInterface.bulkInsert('media', mediaSeeders);

    await queryInterface.bulkUpdate('users',
      { profile_pic_id: 3 },
      [{ id: 4 }]
    );

    const userProfileSeeders: Omit<ModelAttributes<UserProfile>, 'profile_owner'>[] =  [
      {
        user_id: 1,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        user_id: 2,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        user_id: 3,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        orientation: 100,
        sex: GendersEnum.MALE,
        gender_expression: 99,
        height: 185,
        weight: 90,
        bio: 'I am just a stranger, a real man that you need.',
        constitution: ConstitutionsEnum.AVERAGE
      }, {
        user_id: 4,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        orientation: 70,
        sex: GendersEnum.FEMALE,
        gender_expression: 50,
        height: 159,
        weight: 50,
        bio: 'Looking for a daddy to put me on his hands.',
        constitution: ConstitutionsEnum.AVERAGE
      },
    ];
    await queryInterface.bulkInsert('user-profiles', userProfileSeeders);

    const questionnaireSeeders: Omit<ModelAttributes<Questionnaire>, 'questionnaire_owner'>[] = [
      {
        user_id: 1,
        questionnaire_started: false,
        is_completed: false,
        responses: {},
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },  {
        user_id: 2,
        questionnaire_started: false,
        is_completed: false,
        responses: {},
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },  {
        user_id: 3,
        questionnaire_started: true,
        is_completed: true,
        responses: {
          display_name: "Danya",
          sex: 'MALE',
          gender_expresion: 99
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },  {
        user_id: 4,
        questionnaire_started: true,
        is_completed: true,
        responses: {
          display_name: 'Lara K.',
          sex: 'FEMALE',
          gender_expresion: 50
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }
    ];
    await queryInterface
      .bulkInsert('questionnaires', questionnaireSeeders.map(questionnaire => {
        return {
          ...questionnaire,
          responses: JSON.stringify(questionnaire.responses)
        }
      }));

    await sequelize.close();
    console.log('migration applied');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
