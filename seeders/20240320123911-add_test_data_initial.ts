'use strict';

import seedData from './initial-seed-data.json';
import { OpenersEnum } from '../src/contracts/db/models/enums';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      {
        name: 'users',
        data: seedData.users.map((user) => ({
          ...user,
          location: Sequelize.fn(
            'ST_GeomFromGeoJSON',
            JSON.stringify(user.location),
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'user-profiles',
        data: seedData.userProfiles.map((profile) => ({
          ...profile,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'questionnaires',
        data: seedData.questionnaires.map((q) => ({
          ...q,
          responses: JSON.stringify(q.responses),
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'user-stats',
        data: seedData.userStats.map((stat) => ({
          ...stat,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'media',
        data: seedData.media.map((media) => ({
          ...media,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'advertisements',
        data: seedData.advertisements.map((ad) => ({
          ...ad,
          location: Sequelize.fn(
            'ST_GeomFromGeoJSON',
            JSON.stringify(ad.location),
          ),
          filter: JSON.stringify(ad.filter),
          openers: ad.openers as string[],
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
      {
        name: 'advertisement-media',
        data: seedData.advertisementMedia.map((am) => ({
          ...am,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      },
    ];

    for (const table of tables) {
      if (table.data.length) {
        await queryInterface.bulkInsert(table.name, table.data, {});
      }
    }
  },

  async down(queryInterface) {
    const tables = [
      'advertisement-media',
      'advertisements',
      'media',
      'user-stats',
      'questionnaires',
      'user-profiles',
      'users',
    ];

    for (const table of tables) {
      await queryInterface.bulkDelete(table, null, {});
    }
  },
};
