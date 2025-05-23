import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Like } from '../../contracts/db/models/like.entity';
import { UserStats } from '../../contracts/db/models/user-stats.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';
import { Chat } from '../../contracts/db/models/chat.entity';
import { ChatUser } from '../../contracts/db/models/chat-user.entity';
import { ChatTypesEnum } from '../../contracts/db/models/enums';
import { Sequelize } from 'sequelize-typescript';
import { Advertisement } from '../../contracts/db/models/advertisements.entity';
import { User } from '../../contracts/db/models/user.entity';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.LIKE)
    private likeRepository: typeof Like,
    @Inject(MODELS_REPOSITORIES_ENUM.USER_STATS)
    private userStatsRepository: typeof UserStats,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT)
    private chatRepository: typeof Chat,
    @Inject(MODELS_REPOSITORIES_ENUM.CHAT_USER)
    private chatUserRepository: typeof ChatUser,
    @Inject(MODELS_REPOSITORIES_ENUM.ADVERTISEMENTS)
    private adsRepository: typeof ChatUser,
    @Inject('SEQUELIZE')
    private readonly sequelizeInstance: Sequelize,
  ) {}

  async getUserLikes(userId: string): Promise<Like[]> {
    this.logger.log('get user likes', userId);
    const likes = await this.likeRepository.findAll({
      where: {
        user_id: userId,
      },
    });
    if (likes.length) {
      return likes;
    }
    return [];
  }

  async sendLike(user_id: string, advertisement_id: number) {
    const context = { user_id, advertisement_id };
    this.logger.log('Send like', context);
    const advertisement = await this.adsRepository.findOne({
      where: { id: advertisement_id },
    });

    if (!advertisement) {
      this.logger.error('Send like: advertisement does not exist', context);
      throw new NotFoundException('Advertisement does not exist');
    }
    if (advertisement.user_id === user_id) {
      this.logger.error('Send like: user trying to like his own ad', context);
      throw new BadRequestException('User can not like its own advertisement');
    }

    const previousLike = await this.likeRepository.findOne({
      where: {
        rejected: true,
        updatedAt: { [Op.gt]: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      },
    });

    if (previousLike) {
      this.logger.error(
        'Send like: like has been rejected less than 12 hours ago',
        context,
      );
      throw new BadRequestException('User can not like this advertisement');
    }

    const userStats = await this.userStatsRepository.findOne<UserStats>({
      where: {
        user_id,
      },
    });
    if (userStats && userStats.dataValues.available_likes_to_send === 0) {
      this.logger.log('Send like: user do not have enough likes', {
        user_id,
        advertisement_id,
      });
      throw new NotAcceptableException(
        'No likes left for today. Check out later.',
      );
    }

    const like = await this.likeRepository.findOne({
      where: { user_id, advertisement_id },
    });

    if (like) {
      this.logger.error('Send like: user already sent like', {
        user_id,
        advertisement_id,
      });
      throw new BadRequestException('User already sent like.');
    }

    const transaction = await this.sequelizeInstance.transaction();
    try {
      const updatedStats: [number, UserStats[]?] =
        await this.userStatsRepository.update<UserStats>(
          {
            available_likes_to_send: userStats!.available_likes_to_send - 1,
          },
          {
            where: {
              user_id,
            },
            returning: true,
            transaction,
          },
        );
      const stats = updatedStats[1]?.[0];
      const like = await this.likeRepository.create(
        {
          user_id,
          advertisement_id,
          expiration_date: new Date(Date.now() + 3600 * 1000 * 24),
        },
        { returning: true, transaction },
      );
      await transaction.commit();
      this.logger.log('Send like: stats and likes updated', {
        user_id,
        advertisement_id,
      });
      return { like, stats };
    } catch (e) {
      await transaction.rollback();
      this.logger.error('Send like error, rollback', {
        user_id,
        advertisement_id,
        e,
      });
      throw new InternalServerErrorException(
        'Something when we tried to send your like.',
      );
    }
  }

  async dismissLike(user_id, advertisement_id) {
    this.logger.log('Dismiss like', { user_id, advertisement_id });
    const like = await this.likeRepository.findOne({
      where: { user_id, advertisement_id },
    });

    if (!like) {
      this.logger.error('Dismiss like: not found like and adv', {
        user_id,
        advertisement_id,
      });
      throw new NotFoundException(
        'There is no like for the given advertisement',
      );
    }
    try {
      const userStats = await this.userStatsRepository.findOne({
        where: { user_id },
      });
      await this.likeRepository.destroy({
        where: {
          user_id,
          advertisement_id,
        },
      });
      if (userStats!.dataValues.available_likes_to_send < 10) {
        await this.userStatsRepository.update(
          {
            available_likes_to_send: userStats!.available_likes_to_send + 1,
          },
          {
            where: { user_id },
            returning: true,
          },
        );
      }
      return;
    } catch (e) {
      this.logger.error('Dismiss like', { user_id, advertisement_id, e });
      throw new InternalServerErrorException('Can not dismiss like.');
    }
  }

  async rejectLike(userId: string, likeId: number): Promise<void> {
    const context = { userId, likeId };
    this.logger.log('Reject like', context);
    const like = await this.likeRepository.findByPk(likeId, {
      include: [
        {
          model: Advertisement,
          as: 'advertisement',
          attributes: ['user_id'],
        },
      ],
    });
    if (!like) {
      this.logger.error('Reject like: like not found', context);
      throw new NotFoundException('Like not found');
    }

    const adAuthorId = like.advertisement.user_id;
    if (userId !== adAuthorId) {
      this.logger.error('Reject like: userId not matched with ad author', {});
      throw new BadRequestException('Current user can not reject this like');
    }

    const transaction = await this.sequelizeInstance.transaction();
    try {
      // update userStats of liker
      const updatedLike: [number, Like[]?] = await this.likeRepository.update(
        { rejected: true },
        { where: { id: likeId }, returning: true, transaction },
      );
      this.logger.log('Reject like: like update', context);

      if (updatedLike[1]?.length === 0) {
        this.logger.error('Rejected like: can not update like', context);
        throw new InternalServerErrorException(
          'Something went wrong during like update',
        );
      }
      this.logger.log('Reject like: like update success', context);

      const oldUserStats = await this.userStatsRepository.findOne({
        where: {
          user_id: like.advertisement.user_id,
        },
      });
      this.logger.log('Reject like: got old userStats', context);
      const updatedUserStats: [number, UserStats[]?] =
        await this.userStatsRepository.update(
          {
            available_likes_to_send:
              oldUserStats?.available_likes_to_send &&
              oldUserStats?.available_likes_to_send < 10
                ? oldUserStats?.available_likes_to_send + 1
                : oldUserStats?.available_likes_to_send,
          },
          { where: { user_id: like.user_id }, returning: true, transaction },
        );
      this.logger.log('Reject like: user stats update', context);
      if (updatedUserStats[1]?.length === 0) {
        this.logger.error('Reject like: user stats not updated', context);
        throw new InternalServerErrorException('user stats are not updated');
      }
      await transaction.commit();
      this.logger.log('Reject like: like reject success', context);
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Reject like error', error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async match(userId: string, likeId: number) {
    const context = { userId, likeId };
    this.logger.log('Match', context);
    const transaction = await this.sequelizeInstance.transaction();

    const initialLike = await this.likeRepository.findByPk(likeId);
    if (initialLike?.match) {
      this.logger.error('Match: user trying to match a few times.', context);
      throw new BadRequestException('Not possible to match twice');
    }

    try {
      const like: [number, Like[]?] = await this.likeRepository.update(
        {
          match: true,
        },
        {
          where: { id: likeId },
          returning: true,
          transaction,
        },
      );
      this.logger.log('Match: Like updated', context);

      const chat = await this.chatRepository.create(
        {
          advertisement_id: like[1]?.[0].advertisement_id,
          chat_type: ChatTypesEnum.ACTIVE,
        },
        {
          returning: true,
          transaction,
        },
      );
      this.logger.log('Match: Chat created', { userId, likeId });

      await this.chatUserRepository.create(
        {
          user_id: userId, // ad author
          chat_id: chat.id,
        },
        { transaction },
      );
      await this.chatUserRepository.create(
        {
          user_id: like[1]?.[0].user_id, // like sender
          chat_id: chat.id,
        },
        { transaction },
      );
      this.logger.log('Match: Chat users added', { userId, likeId });

      const authorUserStats = await this.userStatsRepository.findOne({
        where: { user_id: userId },
      });
      const likeSenderUserStats = await this.userStatsRepository.findOne({
        where: { user_id: like[1]?.[0].user_id },
      });

      if (!authorUserStats || !likeSenderUserStats) {
        this.logger.error('Match: User stats 404, rollback', {
          userId,
          likeId,
        });
        await transaction.rollback();
        throw new NotFoundException('User stats for matched users not found');
      }

      const newAuthorStats: [number, UserStats[]?] =
        await this.userStatsRepository.update(
          {
            active_chats: authorUserStats!.available_active_chats + 1,
          },
          {
            where: { id: authorUserStats!.id },
            returning: true,
            transaction,
          },
        );
      const newLikerStats: [number, UserStats[]?] =
        await this.userStatsRepository.update(
          {
            active_chats: likeSenderUserStats!.available_active_chats + 1,
          },
          {
            where: { id: likeSenderUserStats!.id },
            returning: true,
            transaction,
          },
        );
      this.logger.log('Match: Stats are updated', { userId, likeId });
      await transaction.commit();
      return {
        chat,
        author_stats: newAuthorStats[1]?.[0],
        liker_stats: newLikerStats[1]?.[0],
      };
    } catch (error) {
      this.logger.error('Match', { userId, likeId, error });
      await transaction.rollback();
      throw new InternalServerErrorException('Can not match these users.');
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  private async refillAvailableLikesCron() {
    const batchSize = 1000;
    let lastProcessedId = 0;

    while (true) {
      const users = await this.fetchUsersBatch(lastProcessedId, batchSize);

      if (users.length === 0) break;
      for (const user of users) {
        await this.refillUserLikes(user.id, 10);
        await new Promise((resolve) => setImmediate(resolve));
      }
      lastProcessedId = users[users.length - 1].id;
    }
  }

  private async fetchUsersBatch(lastId: number, batchSize: number) {
    return this.userStatsRepository.findAll({
      where: { id: { [Op.gt]: lastId } },
      limit: batchSize,
      order: [['id', 'ASC']],
    });
  }

  private async refillUserLikes(userId: string, likes: number) {
    return this.userStatsRepository.update(
      {
        available_likes_to_send: likes,
        available_likes_refilled_date: Date.now(),
      },
      {
        where: { id: userId },
        returning: true,
      },
    );
  }
}
