import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserStats } from '../../contracts/db/models/user-stats.entity';
import { MODELS_REPOSITORIES_ENUM } from '../../contracts/db/models/models.enum';

@Injectable()
export class UserStatsService {
  private readonly logger = new Logger(UserStatsService.name);
  constructor(
    @Inject(MODELS_REPOSITORIES_ENUM.USER_STATS)
    private readonly userStatsRepository: typeof UserStats,
  ) {}

  async getUserStats(userId: string) {
    this.logger.log(`Getting user stats for ${userId}`);
    const userStats = await this.userStatsRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    console.log({ userStats });
    if (!userStats) {
      this.logger.error(`No user stats found with user_id ${userId}`);
      throw new NotFoundException('User Stats not found');
    }
    return userStats;
  }
}
