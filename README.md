# Tekero Backend
The Tekero Backend is the monolith app that is built in event/message driven way. It means that all the business logic is isolated under the separate modules each of those responsible for each chunk of the business functionality, and every module can't communicate with each other directly. The only way how modules can access each other is the RMQ. It's done with purpose of the further simplified scaling of the application into microservices and to make initial development much simplier since you only need to run a single app from single folder by a single command. 

   

# Starting up 
1. Prepare env variables
2. Local (option 1)
3. Docker (option 2)
4. Docker-compose (option 3 *recommended*)
5. Migrations and seeders
6. Testing and test helpers
7. Initial dataset
8. Custom build scripts

#### 1. Prepare env variables
Application running locally using `.env.development` (for that purpose while starting up the app don't forget to add `NODE_ENV=development` because docker-compose will concatenate `.env.` with `NODE_ENV` to define a proper `.env` file to run app with).

Duplicate and rename file `.env.test` with `.env.development` and prepare variables to be used in your app. Contact your  managers to get necessary AWS credentials or use yours. 

#### 2. Local (I don't know how to run it locally without docker)
...
#### 3. Docker (you need all infrastructure to be installed)
```
docker build -t grinder_nest .

# Without hotreload
docker run -p 3000:3000 grinder_nest
# With hotreload
docker run -p 3000:3000 -v $(pwd):/app grinder_nest
```

#### 4. Docker-compose (*recommended*)
```
make up # or
docker compose up --build
```

#### 5. Migrations and seeders
Migrations and seeders apply on `docker compose up` due to Dockerfile configuration. 
`npx sequelize-cli db:seed:all --url 'postgres://username:password@localhost:5432/dbname'
`

#### 6. Testing
To run tests you need all infrastructure up and running (RMQ, PSQL). Tests are running using real environment because mocked data and responses aren't actually test anything. 

To run tests locally you need to use file `.env.test.local` for env variables declaration. Npm command to run local tests is `npm run test:local`. Pay attention to startup scripts for the jest: `jest-setup.js` and `jest-teardown.js` - they are preparing database, running migration, creating and deleting testing databases. 

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
    userId: string;
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
Then implement this abstract class in a business controller.
```typescript
export interface IQuestionnaireController {
  getQuestionnaire: (payload: IGetQuestionnaire.Request, context: RmqContext) => Promise<IGetQuestionnaire.Response>
  submitQuestionByShortcode: (payload: ISubmitQuestionByShortcode.Request, context: RmqContext) => Promise<ISubmitQuestionByShortcode.Response>
};
```

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
1. Before all, add a new queue name to `API_MODULE_QUEUES`
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
    @Param('userId') userId: string,
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
To be sure that data that comes to the api endpoint is correct and to avoid pushing potentially wrong data to the RMQ and other controllers, use DTO and validation on the top level of the proxy api.
#### 4. Update app.module.ts
Add new controller to `imports`.
#### 5. Update main.ts
```typescript
await createRmqMicroservices(app, [
    ...QUESTIONNAIRE_MODULE_QUEUES,
    ...OTHER_QUEUES
  ], generalRmqOpts);
```
