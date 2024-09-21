import { INestApplication, Inject, Injectable, Module } from '@nestjs/common';
import { getDbModule } from '../src/utils/db-utils.nest';
import { dbOpts } from '../src/config/config';
import { NestFactory } from '@nestjs/core';
import { MODELS_REPOSITORIES_ENUM } from '../src/contracts/db/models/models.enum';
import { User, UserRepository } from '../src/contracts/db/models/user.entity';
import { GendersEnum } from '../src/contracts/db/models/enums';
import { SuperSequelize } from './helpers/control-over-db';

const db = new SuperSequelize(dbOpts);

describe('DB connection', () => {
  @Injectable()
  class TestService {
    constructor(
      @Inject(MODELS_REPOSITORIES_ENUM.USER)
      private userRepository: typeof User,
    ) {}

    async getUser(id: number): Promise<User> {
      const user = await this.userRepository.findByPk<User>(id);
      return user as User;
    }

    async createUser(): Promise<User> {
      const user = await this.userRepository.create<User>({
        firstName: 'ihor',
        lastName: 'test',
        sex: GendersEnum.MALE,
        email: 'test@test.com',
        dob: new Date('1992-10-18').toISOString(), // Use ISO string for date
      });
      return user;
    }

    async deleteUser(id: number): Promise<void> {
      await this.userRepository.destroy<User>({ where: { id } });
    }
  }

  @Module({
    imports: [
      getDbModule([dbOpts], true), // Ensure it points to the test DB
    ],
    controllers: [],
    providers: [TestService, UserRepository],
  })
  class TestModule {}

  let app: INestApplication;
  let testUserId: number;

  beforeAll(async () => {
    app = await NestFactory.create(TestModule);
    await app.init(); // Correct initialization step
  });

  afterAll(async () => {
    const testService = app.get<TestService>(TestService);
    if (testUserId) {
      await testService.deleteUser(testUserId);
    }
    await app.close();
  });

  it('Should be able to create and read records in DB', async () => {
    const testService = app.get<TestService>(TestService);
    const { id, firstName, lastName } = await testService.createUser();
    const user = await testService.getUser(id);
    testUserId = id;
    expect(firstName).toEqual('ihor');
    expect(lastName).toEqual('test');
    expect(user.firstName).toEqual('ihor');
    expect(user.lastName).toEqual('test');
  });
});
