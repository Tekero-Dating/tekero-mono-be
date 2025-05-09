import { Controller, Inject } from '@nestjs/common';
import { UserStatsService } from './user-stats.service';
import { MessagePattern } from '@nestjs/microservices';
import { USER_STATS_MSG_PATTERNS } from '../../contracts/user-stats-interface/user-stats.constants';
import { IUSerStatsController } from '../../contracts/user-stats-interface/user-stats.api-interface';
import { TekeroError } from '../../utils/error-handling-utils';

@Controller('user-stats')
export class UserStatsController implements IUSerStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @MessagePattern(USER_STATS_MSG_PATTERNS.GET)
  async getUserStats(payload) {
    try {
      const { userId } = payload;
      const result = await this.userStatsService.getUserStats(userId);
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: TekeroError(error),
      };
    }
  }

  // @MessagePattern(USER_STATS_MSG_PATTERNS.GET)
  async setActiveChatLimit(payload) {
    return {
      success: true,
    };
  }

  // @MessagePattern(USER_STATS_MSG_PATTERNS.GET)
  async setLikesToSendLimit(payload) {
    return {
      success: true,
    };
  }

  // @MessagePattern(USER_STATS_MSG_PATTERNS.GET)
  async setLikedToReceiveLimit(payload) {
    return {
      success: true,
    };
  }
}
