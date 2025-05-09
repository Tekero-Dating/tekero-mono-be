import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  IDeleteUser,
  IEditUser,
  IUserFields,
} from '../../contracts/users-interface/users.api-interface';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { User } from '../../contracts/db/models/user.entity';
import { UserStats } from '../../contracts/db/models/user-stats.entity';
import { UserProfile } from '../../contracts/db/models/user-profile.entity';
import { UserSettings } from '../../contracts/db/models/user-settings.entity';
import { hashPassword } from '../../utils/hash-password';
import { Sequelize } from 'sequelize-typescript';
import { Session } from '../../contracts/db/models/sessions.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.USER)
    private userRepository: typeof User,
    @Inject(MODELS_REPOSITORIES_ENUM.USER_STATS)
    private userStatsRepository: typeof UserStats,
    @Inject(MODELS_REPOSITORIES_ENUM.USER_PROFILE)
    private userProfileRepository: typeof UserProfile,
    @Inject(MODELS_REPOSITORIES_ENUM.USER_SETTINGS)
    private userSettingsRepository: typeof UserSettings,
    @Inject(MODELS_REPOSITORIES_ENUM.SESSIONS)
    private sessionRepository: typeof Session,
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance: Sequelize,
  ) {}

  async createUser(payload: IUserFields) {
    this.logger.log('Create user called');
    const transaction = await this.sequelizeInstance.transaction();
    try {
      const userFields = {
        ...payload,
        password: await hashPassword(payload.password),
      };
      const user = await this.userRepository.create(userFields, {
        transaction,
      });
      this.logger.log('User created');
      const userStats = await this.userStatsRepository.create(
        {
          user_id: user.id,
          active_chats: 0,
          available_likes_to_send: 10,
          available_likes_refilled_date: Date.now(),
        },
        { transaction },
      );
      this.logger.log('User Stats created');
      const userProfile = await this.userProfileRepository.create(
        {
          user_id: user.id,
        },
        { transaction },
      );
      this.logger.log('User Profile created');
      const userSettings = await this.userSettingsRepository.create(
        {
          user_id: user.id,
        },
        { transaction },
      );
      this.logger.log('User Settings created');
      await transaction.commit();
      return { user, userStats, userProfile, userSettings };
    } catch (error) {
      this.logger.error('create user failed, rollback', { error, payload });
      await transaction.rollback();
      throw new InternalServerErrorException('User can not be created.');
    }
  }

  async deleteUser(payload: IDeleteUser.Request) {
    this.logger.log('Delete user', { userId: payload.userId });
    const transaction = await this.sequelizeInstance.transaction();
    try {
      // TODO: don't delete all the records. Instead deactivate records and provide a reason
      await this.userStatsRepository.destroy({
        where: { user_id: payload.userId },
      });
      await this.userProfileRepository.destroy({
        where: { user_id: payload.userId },
      });
      await this.userSettingsRepository.destroy({
        where: { user_id: payload.userId },
      });
      await this.sessionRepository.destroy({
        where: { user_id: payload.userId },
      });
      await this.userRepository.destroy({ where: { id: payload.userId } });
      await transaction.commit();
      return;
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Can not delete user', { payload, error });
      throw new InternalServerErrorException('User can not be deleted now.');
    }
  }

  async editUser(userId: number, fields: IEditUser.Request['fields']) {
    this.logger.log('Edit user start', { userId });
    try {
      const [numberOfAffectedRows, [updatedRecord]] =
        await this.userRepository.update(
          { ...fields },
          { where: { id: userId }, returning: true },
        );
      this.logger.log('User updated', { userId, numberOfAffectedRows });
      if (!numberOfAffectedRows) {
        this.logger.error('Nothing to update, user not updated', { userId });
        throw new BadRequestException('Nothing to update');
      }
      return updatedRecord;
    } catch (error) {
      this.logger.error('Error appeared', { userId, error });
      throw new InternalServerErrorException('Can not update the user.');
    }
  }
}
