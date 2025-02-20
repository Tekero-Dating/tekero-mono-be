import {
  Body,
  Controller,
  Delete,
  Inject,
  Post,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  USERS_MSG_PATTERNS,
  USERS_SERVICE_NAME,
} from '../../contracts/users-interface/users.constants';
import { ClientProxy } from '@nestjs/microservices';
import { JwtReq } from '../../utils/auth.jwt.strategy';
import { CreateUserDTO } from '../../contracts/users-interface/users.api.dto';
import { rmqSend } from '../../utils/rmq-utils.nest';
import { TekeroError } from '../../utils/error-handling-utils';
import {
  ICreateUser,
  IDeleteUser,
  IEditUser,
} from '../../contracts/users-interface/users.api-interface';
import { JwtAuthGuard } from '../../utils/jwt.auth-guard';

@Controller('api/users')
export class ApiUsersController {
  constructor(
    @Inject(USERS_SERVICE_NAME)
    private readonly client: ClientProxy,
  ) {}
  async onApplicationBootstrap() {
    await this.client.connect();
  }
  async onApplicationShutdown(signal?: string) {
    await this.client.close();
  }

  @Post('create-user')
  @UsePipes(
    new ValidationPipe({
      transform: true,
    }),
  )
  async createUser(@Body() payload: CreateUserDTO, @Res() res) {
    await rmqSend<ICreateUser.Request, ICreateUser.Response>(
      this.client,
      USERS_MSG_PATTERNS.CREATE,
      payload,
      ({ success, result, error }) => {
        if (success) {
          return res.status(201).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res
            .status(status)
            .send({ success, error: { status, message } });
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-user')
  async deleteUser(
    @Body() payload: IDeleteUser.Request,
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    await rmqSend<IDeleteUser.Request, IDeleteUser.Response>(
      this.client,
      USERS_MSG_PATTERNS.DELETE,
      { ...payload, userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(202).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res
            .status(status)
            .send({ success, error: { status, message } });
        }
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('edit-user')
  async editUser(
    @Body() payload: IEditUser.Request['fields'],
    @Request() req: JwtReq,
    @Res() res,
  ) {
    const { userId } = req.user;
    await rmqSend(
      this.client,
      USERS_MSG_PATTERNS.EDIT,
      { userId, fields: payload },
      ({ success, result, error }) => {
        if (success) {
          return res.status(202).send({ success, result });
        } else {
          const { status, message } = TekeroError(error);
          return res
            .status(status)
            .send({ success, error: { status, message } });
        }
      },
    );
  }
}
