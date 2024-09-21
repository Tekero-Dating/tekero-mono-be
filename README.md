# Installation
`npm ci`

# Starting up 
1. Local
2. Docker 
3. Docker-compose
4. Migrations and seeders
5. Testing

#### 2. Docker
```
docker build -t grinder_nest .

# Without hotreload
docker run -p 3000:3000 grinder_nest
# With hotreload
docker run -p 3000:3000 -v $(pwd):/app grinder_nest
```

#### 3. Docker-compose (*recommended*)
```
NODE_ENV=development docker compose up --build
```

#### 4. Migrations and seeders
Migrations and seeders apply on `docker compose up` due to Dockerfile configuration. 
`npx sequelize-cli db:seed:all --url 'postgres://username:password@localhost:5432/dbname'
`

#### 5. Testing
To run tests you need all infrastructure uo and running (RMQ, PSQL). Tests are running using real environment because mocked data and responses aren't actually test anything. 

To run tests localy you need to use file `.env.test.local` for env variables declaration. Npm command to run local tests is `npm run test:local`. Pay attention to startup scripts for jest: `jest-setup.js` and `jest-teardown.js` - they are preparing database, running migration, creating and deleting testing databases. 

# New endpoints creation  
All business chunks of the app working through `api` module which acts as a `proxy-api` layer that communicates with all other services through RMQ. 
```
                     --- ads.controller
api-module -- RMQ --|--- user-profiles.controller
                     --- user.controller
```
So we can consider that we have 3 levels which all together building an endpoint:
1. proxy-api
2. RMQ
3. business-controller  

Let's start building.

#### 1. Declare an abstract class which will be implemented by business controller
Declare business methods and the corresponding types:
```typescript
export namespace IEditAdv {
  export interface Request {
    userId: number;
    fields: Partial<IAdvFields>;
  };
  export interface Response {
    success: boolean;
    result?: Advertisement;
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
}
``` 
Then implement this abstract class.

#### 2. Build module with controller that implements an abstract class
```typescript
/* module.ts */
@Module({
  imports: [
    ClientsModule.register(
      generateRmqOptions(
        QUESTIONNAIRE_MODULE_QUEUES,
        QUESTIONNAIRE_SERVICE_NAME
      )
    )
  ],
  controllers: [ QuestionnaireController ],
  providers: [ QuestionnaireService ],
})
export class QuestionnaireModule {}

```
```typescript
/* controller.ts */
@Controller('questionnaire')
export class QuestionnaireController implements IQuestionnaireController {
  constructor (
    private readonly questionnaireService: QuestionnaireService,
    @Inject(QUESTIONNAIRE_SERVICE_NAME) private client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @MessagePattern(QUESTIONNAIRE_MSG_PATTERNS.SUBMIT_QUESTIONNAIRE)
  async submitQuestionsByStepId(@Payload() data, @Ctx() context: RmqContext) {
    return {
      success: true
    };
  }
}
```
#### 3. Develop proxy-api for new endpoint
1. Before all add new queue name to `API_MODULE_QUEUES`
2. In `api.module.ts` in imports don't forget to register a new `ClientsModule`
```typescript
ClientsModule.register(
  generateRmqOptions(
    QUESTIONNAIRE_MODULE_QUEUES, 
    QUESTIONNAIRE_SERVICE_NAME
  )  
)
```
Now to controller...
```typescript
/* api.controller.ts */
@Controller('api/questionnaire')
export class ApiQuestionnaireController {
  constructor (
    @Inject(QUESTIONNAIRE_SERVICE_NAME)
    private readonly client: ClientProxy
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @Get('get-questionnaire/:userId')
  async getQuestionnaire(
    @Param('userId') userId: number,
    @Res() res
  ) {
    rmqSend<IGetQuestionnaire.Request, IGetQuestionnaire.Response>(
      this.client,
      QUESTIONNAIRE_MSG_PATTERNS.GET_QUESTIONNAIRE,
      { userId },
      ({ success, result, error }) => {
        if (success) {
          return res.status(200).send(result);
        } else {
          const { status, message } = TekeroError(error);
          res.status(status).send(message);
        }
      }
    );
  }
}
```
#### 4. Update app.module.ts
Add new controller to `imports`.
#### 5. Update main.ts
```typescript
await createRmqMicroservices(app, [
    ...QUESTIONNAIRE_MODULE_QUEUES,
    ...OTHER_QUEUES
  ], generalRmqOpts);
```
