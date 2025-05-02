'use strict';

import { User } from '../src/contracts/db/models/user.entity';
import { Media } from '../src/contracts/db/models/mdeia.entity';
import { Model } from 'sequelize';

import { GendersEnum } from '../src/contracts/db/models/enums';
import { UserProfile } from '../src/contracts/db/models/user-profile.entity';
import { QuestionnaireSteps } from '../src/contracts/db/models/questionnaire-steps.entity';

/** @type {import("sequelize-cli").Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
    type OmitFunctions<T> = Pick<
      T,
      {
        [K in keyof T]: T[K] extends Function ? never : K;
      }[keyof T]
    >;
    type ModelAttributes<T extends Model> = OmitFunctions<
      OmitSequelizeSpecific<T>
    >;

    const questionnaireStepsSeeds: Omit<
      ModelAttributes<QuestionnaireSteps>,
      'userProfile'
    >[] = [
      {
        active: true,
        question: {
          shortcode: 'sex',
          question: 'Specify your gender?',
          languages: {
            es: '¿Especifica tu género?',
            ru: 'Укажите ваш пол?',
          },
          affected_property: 'sex',
          type: 'string',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'orientation',
          question: 'Specify your orientation?',
          languages: {
            es: '¿Especifica tu orientación?',
            ru: 'Укажите вашу ориентацию?',
          },
          affected_property: 'orientation',
          type: 'string',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'gender_expression',
          question: 'Specify your gender expression?',
          languages: {
            es: '¿Especifica tu expresión de género?',
            ru: 'Укажите свою гендерную направленность?',
          },
          affected_property: 'sexuality',
          type: 'number',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'current_geo',
          question: 'What is your current location?',
          languages: {
            es: '¿Donde estas?',
            ru: 'Где вы находитесь?',
          },
          affected_property: 'location',
          type: 'location',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'hometown',
          question: 'What is your hometown?',
          languages: {
            es: '¿De donde eres?',
            ru: 'Откуда вы?',
          },
          affected_property: 'hometown',
          type: 'location',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: true,
      },
      {
        active: true,
        question: {
          shortcode: 'body_composition',
          question: 'What is your body composition?',
          languages: {
            es: '¿Cuál es tu composición corporal?',
            ru: 'Какое у вас телосложение?',
          },
          affected_property: 'body_composition',
          type: 'number',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: true,
      },
      {
        active: true,
        question: {
          shortcode: 'height',
          question: 'Your height?',
          languages: {
            es: '¿Tu altura?',
            ru: 'Ваш рост?',
          },
          affected_property: 'height',
          type: 'number',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: true,
      },
      {
        active: true,
        question: {
          shortcode: 'weight',
          question: 'Your weight?',
          languages: {
            es: '¿Tu peso?',
            ru: 'Ваш вес?',
          },
          affected_property: 'weight',
          type: 'number',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: true,
      },
      {
        active: true,
        question: {
          shortcode: 'why_joining',
          question: 'Why are you joining Tekero?',
          languages: {
            es: '¿Por qué te unes a Tekero?',
            ru: 'С какой целью вы хотите в Текеро?',
          },
          affected_property: null,
          type: 'string',
          variations_of_answer: [
            {
              en: 'Serious Relationship',
              es: 'Relación seria',
              ru: 'Серьезные отношения',
            },
            {
              en: 'Casual connections',
              es: 'Conexiones casuales',
              ru: 'Случайные связи',
            },
            {
              en: 'Travel Buddy',
              es: 'Compañero de viaje',
              ru: 'Партнера для путешествий',
            },
            {
              en: 'Meeting New People',
              es: 'Conocer la gente nueva',
              ru: 'Познакомиться с новыми людьми',
            },
            {
              en: 'Open to Anything\n',
              es: 'Abierto a todo',
              ru: 'Открыты ко всему',
            },
          ],
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'style_or_vibe',
          question: 'Which Best Describes Your Style or Vibe?',
          languages: {
            es: '¿Cuál describe mejor tu estilo o vibra?',
            ru: 'Что лучше всего описывает ваш стиль или вайб?',
          },
          affected_property: null,
          type: 'string',
          variations_of_answer: [
            {
              en: 'Chill & Laid-Back',
              es: 'Tranquilo y relajado',
              ru: 'Спокойный и расслабленный',
            },
            {
              en: 'Adventurous & Spontaneous',
              es: 'Aventurero y espontáneo',
              ru: 'Спонтанный',
            },
            {
              en: 'Artsy & Creative',
              es: 'Artístico y creativo',
              ru: 'Артистичный и креативный',
            },
            {
              en: 'Ambitious & Driven',
              es: 'Ambicioso y motivado',
              ru: 'Амбиции и драйв',
            },
            {
              en: 'Romantic & Emotional',
              es: 'Romántico y emocional',
              ru: 'Романтический, эмоциональный',
            },
            {
              en: 'Outgoing & Social',
              es: 'Extrovertido y sociable',
              ru: 'Общительный экстраверт',
            },
            {
              en: 'Laid-Back Homebody',
              es: 'Relajado y hogareño',
              ru: 'Спокойный домосед',
            },
          ],
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'activities',
          question: 'What Activities Do You Enjoy Most?',
          languages: {
            es: '¿Qué actividades disfrutas más?',
            ru: 'Какие ваши любимые активности?',
          },
          affected_property: null,
          type: 'string',
          variations_of_answer: [
            {
              en: 'Traveling / Exploring New Places',
              es: 'Viajar / Explorar nuevos lugares',
              ru: 'Путешествия и исследвание новых мест',
            },
            {
              en: 'Fitness / Sports',
              es: 'Fitness / Deportes',
              ru: 'Фитнес и спорт',
            },
            {
              en: 'Music / Concerts',
              es: 'Música / Conciertos',
              ru: 'Музыка, концерты',
            },
            {
              en: 'Movies / Netflix',
              es: 'Películas / Netflix',
              ru: 'Фильмы / Нетфликс',
            },
            {
              en: 'Nightlife / Partying',
              es: 'La vida nocturna / Fiestas',
              ru: 'Ночная жизнь и тусовки',
            },
            {
              en: 'Cooking / Culinary Adventures',
              es: 'Cocina / Aventuras culinarias',
              ru: 'Кулинария',
            },
            {
              en: 'Outdoor Adventures (Hiking, Camping)',
              es: 'Aventuras al aire libre (senderismo, acampada)',
              ru: 'Активности на свежем воздухе, хайкинг',
            },
            {
              en: 'Video Games / Esports',
              es: 'Videojuegos / Deportes electrónicos',
              ru: 'Видео-игры',
            },
          ],
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'opener',
          question: 'Which Opener Would You Like for Your Ad?',
          languages: {
            es: '¿Qué abridor le gustaría para su anuncio?',
            ru: 'Выберите опенер для вашего объявления?',
          },
          affected_property: null,
          type: 'string',
          variations_of_answer: [
            {
              en: 'Message (text)',
              es: 'Mensaje (texto)',
              ru: 'Сообщение (текст)',
            },
            {
              en: 'Audio Message',
              es: 'Mensaje de audio',
              ru: 'Аудио сообщение',
            },
            {
              en: 'Video (Short video snippet or clip)',
              es: 'Video (fragmento de video corto o clip)',
              ru: 'Видео (короткое видео или клип)',
            },
            {
              en: 'Photo (Share a photo or set of photos)\n',
              es: 'Foto (comparte una foto o un conjunto de fotos)',
              ru: 'Фото (отправить фото или несколько)',
            },
            {
              en: 'Game (Question game with 3 out of 30 random questions)',
              es: 'Juego (juego de preguntas con 3 de 30 preguntas al azar)',
              ru: 'Игра (ответить на 3 вопроса из 30 вопросов чтобы влюбиться)',
            },
            {
              en: 'Audio Call',
              es: 'Llamada de audio',
              ru: 'Аудиозвонок',
            },
            {
              en: 'Video Call',
              es: 'Llamada de video',
              ru: 'Видеозвонок',
            },
            {
              en: 'Open Question',
              es: 'Pregunta abierta',
              ru: 'Открытый вопрос',
            },
          ],
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
      {
        active: true,
        question: {
          shortcode: 'idioma',
          question: 'Which languages do you speak?',
          languages: {
            es: '¿Que idiomas hablas?',
            ru: 'На каких языках вы говорите?',
          },
          affected_property: null,
          type: 'array',
        },
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15'),
        optional: false,
      },
    ];

    await queryInterface.bulkInsert(
      'questionnaire-steps',
      questionnaireStepsSeeds.map((question) => ({
        ...question,
        question: JSON.stringify(question.question),
      })),
    );
    console.log('migration applied');
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete("People", null, {});
     */
  },
};
