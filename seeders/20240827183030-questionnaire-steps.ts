"use strict";

import { User } from "../src/contracts/db/models/user.entity";
import { Media } from "../src/contracts/db/models/mdeia.entity";
import { Model } from "sequelize";

import { GendersEnum } from "../src/contracts/db/models/enums";
import { UserProfile } from "../src/contracts/db/models/user-profile.entity";
import { QuestionnaireSteps } from "../src/contracts/db/models/questionnaire-steps.entity";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert("People", [{
     *   name: "John Doe",
     *   isBetaMember: false
     * }], {});
     */

    type OmitSequelizeSpecific<T> = Omit<T, keyof Model>;
    type OmitFunctions<T> = Pick<T, {
      [K in keyof T]: T[K] extends Function ? never : K;
    }[keyof T]>;
    type ModelAttributes<T extends Model> = OmitFunctions<OmitSequelizeSpecific<T>>;

    const questionnaireStepsSeeds: Omit<ModelAttributes<QuestionnaireSteps>, "userProfile">[] = [
      {
        "active": true,
        "question": {
          "shortcode": "display_name",
          "question": "Choose name to display?",
          "languages": {
            "es": "Elige el nombre para mostrar?",
            "ru": "Выберите имя для профиля?",
          },
          "affected_property": "display_name",
          "type": "string",
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        "active": true,
        "question": {
          "shortcode": "sex",
          "question": "Specify your gender?",
          "languages": {
            "es": "¿Especifica tu género?",
            "ru": "Укажите ваш пол?",
          },
          "affected_property": "sex",
          "type": "string",
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }, {
        "active": true,
        "question": {
          "shortcode": "gender_expresion",
          "question": "Specify your gender expresion?",
          "languages": {
            "es": "¿Especifica tu expresión de género?",
            "ru": "Укажите свою гендерную направленность?",
          },
          "affected_property": "sexuality",
          "type": "number",
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      },
    ];

    await queryInterface
      .bulkInsert('questionnaire-steps', questionnaireStepsSeeds
          .map(question => ({
            ...question,
            question: JSON.stringify(question.question),
          })),
      );

    console.log("migration applied");
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete("People", null, {});
     */
  }
};
