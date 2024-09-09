'use strict';

import { ActionsList } from '../src/contracts/db/models/actions-list.entity';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert('actions-lists', [{
      actionType: 'SEND_LIKE',
      price: 4,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }, {
      actionType: 'SEND_SIGNED_LIKE',
      price: 14,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }, {
      actionType: 'PUBLISH_AD',
      price: 20,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }, {
      actionType: 'TRAVEL_AD',
      price: 25,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }, {
      actionType: 'TOP_UP',
      price: 0,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }, {
      actionType: 'GIFT',
      price: 0,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15')
    }], {});
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
