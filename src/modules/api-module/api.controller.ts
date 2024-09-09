import { Controller, Get, Inject } from '@nestjs/common';
import { ApiService } from './api.service';
import { ClientProxy } from '@nestjs/microservices';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { API_SERVICE_NAME } from '../../contracts/api-interface/api.constants';

@Controller('api')
export class ApiController {
  constructor(
    private readonly apiService: ApiService,
  ) {}

  @Get('user-profile')
  async getUserProfile() {}

  @Get('user-likes')
  async getUserLikes() {}

  @Get('notifications')
  async getUserNotifications() {}
}
