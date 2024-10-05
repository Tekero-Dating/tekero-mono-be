import {
  Controller,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy, Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { ProfilesService } from './profiles.service';
import {
  IUserProfileController,
  USER_PROFILES_MSG_PATTERNS,
} from '../../contracts/uesr-profiles-interface/user-profiles.api-interface';
import { USER_PROFILES_SERVICE_NAME } from '../../contracts/uesr-profiles-interface/user-profiles.constants';

@Controller('profiles')
export class ProfilesController implements IUserProfileController{
  constructor(
    private readonly userProfilesService: ProfilesService,
    @Inject(USER_PROFILES_SERVICE_NAME) private client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @MessagePattern(USER_PROFILES_MSG_PATTERNS.GET)
  async getUserProfile(@Payload() data, @Ctx() context: RmqContext) {
    try {
      const profile = await this.userProfilesService.getUserProfile(data);
      if (!profile) {
        return {
          success: false,
          error: new NotFoundException('Profile not found') }
      }
      return {
        success: true,
        result: profile
      };
    } catch (error) {
      return {
        success: false,
        error: new InternalServerErrorException('Error during profile fetching')
      };
    }
  }

  @MessagePattern(USER_PROFILES_MSG_PATTERNS.UPDATE)
  async updateUserProfile(@Payload() data, @Ctx() context: RmqContext) {
    try {
      const profile = await this.userProfilesService.updateUserProfile(data.userId, data);
      if (!profile) {
        return {
          success: false,
          error: new NotFoundException('User profile not found')
        }
      }
     return {
        success: true,
        result: { updated: true, profile }
      };
    } catch (error) {
      return {
        success: false,
        error: new InternalServerErrorException(error)
      };
    }
  }
}
