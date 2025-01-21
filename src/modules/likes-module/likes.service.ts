import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotAcceptableException, NotFoundException,
} from '@nestjs/common';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';
import { Like } from '../../contracts/db/models/like.entity';
import { UserStats } from '../../contracts/db/models/user-stats.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';

@Injectable()
export class LikesService {
  private readonly logger = new Logger(LikesService.name);
  constructor (
    @Inject(MODELS_REPOSITORIES_ENUM.LIKE)
    private likeRepository: typeof Like,
    @Inject(MODELS_REPOSITORIES_ENUM.USER_STATS)
    private userStatsRepository: typeof UserStats
  ) {}

  async sendLike(user_id: number, advertisement_id: number) {
    this.logger.log('Send like', { user_id, advertisement_id });
    const userStats = await this.userStatsRepository.findOne<UserStats>({
      where: {
        user_id
      }
    });
    if (userStats && userStats.dataValues.available_likes === 0) {
      this.logger.log('Send like: user do not have enough likes', { user_id, advertisement_id });
      throw new NotAcceptableException('No likes left for today. Check out later.');
    }

    const like = await this.likeRepository.findOne({
      where: { user_id, advertisement_id }
    });

    if (like) {
      this.logger.error('Send like: user already sent like', { user_id, advertisement_id });
      throw new BadRequestException('User already sent like.');
    }

    try {
      // TODO: wrap in transaction?
      const stats = (await this.userStatsRepository.update({
        available_likes: userStats!.available_likes - 1
      }, {
        where: {
          user_id
        }, returning: true
      }))[1][0];
      const like = await this.likeRepository.create({
        user_id,
        advertisement_id,
        expiration_date: new Date(Date.now() + (3600 * 1000 * 24))
      }, { returning: true });
      this.logger.log('Send like: stats and likes updated', { user_id, advertisement_id });
      return { like, stats };
    } catch (e) {
      this.logger.error('Send like error', { user_id, advertisement_id, e });
      throw new InternalServerErrorException('Something when we tried to send your like.');
    }
  }

  async dismissLike(user_id, advertisement_id) {
    this.logger.log('Dismiss like', { user_id, advertisement_id });
    const like = await this.likeRepository.findOne({
      where: { user_id, advertisement_id }
    });

    if (!like) {
      this.logger.error('Dismiss like: not found like and adv', { user_id, advertisement_id });
      throw new NotFoundException('There is no like for the given advertisement');
    }
    try {
      const userStats = await this.userStatsRepository.findOne({
        where: { user_id }
      });
      await this.likeRepository.destroy({
        where: {
          user_id, advertisement_id
        }
      });
      if (userStats!.dataValues.available_likes < 10) {
        await this.userStatsRepository.update({
          available_likes: userStats!.available_likes + 1
        }, {
          where: { user_id }
        });
      }
      return;
    } catch (e) {
      this.logger.error('Dismiss like', { user_id, advertisement_id, e });
      throw new InternalServerErrorException('Can not dismiss like.');
    }
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async refillAvailableLikesCron() {
    const batchSize = 1000;
    let lastProcessedId = 0;

    while (true) {
      const users = await this.fetchUsersBatch(
        lastProcessedId,
        batchSize,
      );

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

  private async refillUserLikes(userId: number, likes: number) {
    return this.userStatsRepository.update(
      {
        available_likes: likes,
        available_likes_refilled_date: Date.now()
      },
      { where: { id: userId } },
    );
  }
}
