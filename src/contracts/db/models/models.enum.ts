import { ModelCtor } from 'sequelize-typescript';
import { User } from './user.entity';
import { UserProfile } from './user-profile.entity';
import { Media } from './mdeia.entity';
import { UserSettings } from './user-settings.entity';
import { Advertisement } from './advertisements.entity';
import { AdvertisementMedia } from './junctions/advertisement-media.entity';
import { ActionsList } from './actions-list.entity';
import { Operation } from './operation.entity';
import { Questionnaire } from './questionnaire.entity';
import { QuestionnaireSteps } from './questionnaire-steps.entity';
import { MediaAccess } from './mdeia-access.entity';
import { Session } from './sessions.entity';
import { Like } from './like.entity';
import { UserStats } from './user-stats.entity';
import { Notification } from './notification.entity';
import { ChatUser } from './chat-user.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';

export const DB_MODELS: ModelCtor[] = [
  User,
  UserProfile,
  UserSettings,
  Advertisement,
  Media,
  MediaAccess,
  AdvertisementMedia,
  ActionsList,
  Operation,
  Questionnaire,
  QuestionnaireSteps,
  Session,
  Like,
  UserStats,
  Notification,
  ChatUser,
  Chat,
  Message,
];

export const MODELS_REPOSITORIES_ENUM = {
  USER: 'USER_REPOSITORY',
  GRINDER: 'GRINDER_REPOSITORY',
  USER_PROFILE: 'USER_PROFILE_REPOSITORY',
  MEDIA: 'MEDIA_REPOSITORY',
  MEDIA_ACCESS: 'MEDIA_ACCESS_REPOSITORY',
  LIKE: 'LIKE_REPOSITORY',
  USER_SETTINGS: 'USER_SETTINGS_REPOSITORY',
  ADVERTISEMENTS: 'ADVERTISEMENTS_REPOSITORY',
  ADVERTISEMENTS_MEDIA: 'ADV_MEDIA_REPOSITORY',
  ACTIONS_LIST: 'ACTIONS_LIST_REPOSITORY',
  OPERATION: 'OPERATIONS_REPOSITORY',
  QUESTIONNAIRE_STEPS: 'QUESTIONNAIRE_STEPS_REPOSITORY',
  QUESTIONNAIRE: 'QUESTIONNAIRE_REPOSITORY',
  SESSIONS: 'SESSIONS_REPOSITORY',
  USER_STATS: 'USER_STATS_REPOSITORY',
  NOTIFICATION: 'NOTIFICATION_REPOSITORY',
  CHAT_USER: 'CHAT_USER_REPOSITORY',
  CHAT: 'CHAT_REPOSITORY',
  MESSAGE: 'MESSAGE_REPOSITORY',
};
