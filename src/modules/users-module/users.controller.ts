import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ICreateUser,
  IDeleteUser,
  IEditUser,
  IRegisterUser,
  IUsersController,
} from '../../contracts/users-interface/users.api-interface';
import {
  USERS_MSG_PATTERNS,
  USERS_SERVICE_NAME,
} from '../../contracts/users-interface/users.constants';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { UsersService } from './users.service';
import { TekeroError } from '../../utils/error-handling-utils';

@Controller('users')
export class UsersController implements IUsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(
    @Inject(USERS_SERVICE_NAME) private client: ClientProxy,
    private readonly usersService: UsersService,
  ) {}
  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @MessagePattern(USERS_MSG_PATTERNS.CREATE)
  async createUser(
    @Payload() payload: ICreateUser.Request,
    @Ctx() context: RmqContext,
  ): Promise<ICreateUser.Response> {
    this.logger.log('Create user request', { email: payload.email });
    try {
      const result = await this.usersService.createUser(payload);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: TekeroError(error) };
    }
  }

  @MessagePattern(USERS_MSG_PATTERNS.DELETE)
  async deleteUser(
    @Payload() payload: IDeleteUser.Request,
    @Ctx() context: RmqContext,
  ): Promise<IDeleteUser.Response> {
    this.logger.log('Delete user request', { payload });
    try {
      await this.usersService.deleteUser(payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: TekeroError(error) };
    }
  }

  @MessagePattern(USERS_MSG_PATTERNS.EDIT)
  async editUser(
    @Payload() payload: IEditUser.Request,
    @Ctx() context: RmqContext,
  ): Promise<IEditUser.Response> {
    this.logger.log('Edit user request', { userId: payload.userId });
    try {
      const updatedUser = await this.usersService.editUser(
        payload.userId,
        payload.fields,
      );
      return { success: true, result: { user: updatedUser } };
    } catch (error) {
      return { success: false, error: TekeroError(error) };
    }
  }

  @MessagePattern(USERS_MSG_PATTERNS.REGISTER)
  async registerUser(
    @Payload() payload: IRegisterUser.Request,
  ): Promise<IRegisterUser.Response> {
    try {
      const user = await this.usersService.register(
        payload.user_id,
        payload.email,
      );
      return { success: true, result: { user } };
    } catch (error) {
      return { success: false, error: TekeroError(error) };
    }
  }
}
