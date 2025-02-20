import { ADS_MODULE_QUEUES } from '../ads-interface/ads.constants';
import { USER_PROFILES_MODULE_QUEUES } from '../uesr-profiles-interface/user-profiles.constants';
import { QUESTIONNAIRE_MODULE_QUEUES } from '../questionnaire-interface/questionnaire.constants';

export const API_MODULE_QUEUES = [
  ...USER_PROFILES_MODULE_QUEUES,
  ...ADS_MODULE_QUEUES,
  ...QUESTIONNAIRE_MODULE_QUEUES,
];
export const API_SERVICE_NAME = 'API_SERVICE';
