import { RmqContext } from '@nestjs/microservices';
import { QuestionnaireSteps } from '../db/models/questionnaire-steps.entity';
import { Questionnaire } from '../db/models/questionnaire.entity';

export const QUESTIONNAIRE_MSG_PATTERNS = {
  GET_QUESTIONNAIRE: 'get_questionnaire',
  SUBMIT_QUESTIONNAIRE: 'susbmit_questionnaire'
};

export namespace IGetQuestionnaire {
  export interface Request {
    userId: number;
  };
  export interface Response {
    success: boolean;
    result?: {
      started: boolean;
      completed: boolean;
      questions?: {
        answered: boolean;
        response?: string | number | boolean,
        question: QuestionnaireSteps['question'];
      }[];
    };
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  }
};

export namespace ISubmitQuestionsByStepId {
  export interface Request {
    userId: number;
    responses: {
      stepId: QuestionnaireSteps['id'];
      response:  string | number | boolean;
    }[]
  };
  export interface Response {
    success: boolean;
    result?: {
      completed: boolean;
    };
    error?: Record<string, any> | {
      status: number;
      message: string;
    };
  };
};

export interface IQuestionnaireController {
  getQuestionnaire: (payload: IGetQuestionnaire.Request, context: RmqContext) => Promise<IGetQuestionnaire.Response>
  submitQuestionsByStepId: (payload: ISubmitQuestionsByStepId.Request, context: RmqContext) => Promise<ISubmitQuestionsByStepId.Response>
};
