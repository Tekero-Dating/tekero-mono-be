'use strict';
import { Sequelize as SEQUELIZE } from 'sequelize-typescript';
import { dbOpts } from '../src/config/config';
import seedData from './initial-seed-data.json';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = new SEQUELIZE({
      dialect: dbOpts.driver,
      ...dbOpts,
    });
    sequelize.addModels(dbOpts.models);

    await sequelize.sync({ force: true });

    await queryInterface.bulkInsert(
      'users',
      seedData.users.map((user) => ({
        ...user,
        location: Sequelize.fn(
          'ST_GeomFromGeoJSON',
          JSON.stringify(user.location),
        ),
      })),
    );

    await queryInterface.bulkInsert('user-profiles', seedData.userProfiles);

    await queryInterface.bulkInsert(
      'questionnaires',
      seedData.questionnaires.map((q) => ({
        ...q,
        responses: JSON.stringify(q.responses),
      })),
    );

    await queryInterface.bulkInsert('user-stats', seedData.userStats);
    await queryInterface.bulkInsert('media', seedData.media);

    await queryInterface.bulkInsert(
      'advertisements',
      seedData.advertisements.map((ad) => ({
        ...ad,
        location: Sequelize.fn(
          'ST_GeomFromGeoJSON',
          JSON.stringify(ad.location),
        ),
        filter: JSON.stringify(ad.filter),
      })),
    );

    await queryInterface.bulkInsert(
      'advertisement-media',
      seedData.advertisementMedia,
    );

    await sequelize.close();
    console.log('Seeder applied successfully');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('advertisement-media', null, {});
    await queryInterface.bulkDelete('advertisements', null, {});
    await queryInterface.bulkDelete('media', null, {});
    await queryInterface.bulkDelete('user-stats', null, {});
    await queryInterface.bulkDelete('questionnaires', null, {});
    await queryInterface.bulkDelete('user-profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
