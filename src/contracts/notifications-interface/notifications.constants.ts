import { NotificationTypesEnum } from '../db/models/enums';

export const NOTIFICATIONS_MODULE_QUEUES = [ 'notifications', 'notification-delivery' ];
export const NOTIFICATIONS_SERVICE_NAME = 'NOTIFICATIONS_SERVICE';
export const NOTIFICATIONS_DELIVERY_SERVICE_NAME = 'NOTIFICATIONS_DELIVERY_SERVICE_NAME';
export const NOTIFICATIONS_MSG_PATTERNS = NotificationTypesEnum;
