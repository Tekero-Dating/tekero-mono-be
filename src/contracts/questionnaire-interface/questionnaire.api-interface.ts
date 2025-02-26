import { RmqContext } from '@nestjs/microservices';
import { QuestionnaireSteps } from '../db/models/questionnaire-steps.entity';
import { Questionnaire } from '../db/models/questionnaire.entity';

export const QUESTIONNAIRE_MSG_PATTERNS = {
  GET_QUESTIONNAIRE: 'get_questionnaire',
  SUBMIT_QUESTIONNAIRE: 'susbmit_questionnaire',
};

export namespace IGetQuestionnaire {
  export interface Request {
    userId: number;
  }
  export interface Response {
    success: boolean;
    result?: {
      started: boolean;
      completed: boolean;
      questions?: {
        answered: boolean;
        response?: string | number | boolean;
        question: QuestionnaireSteps['question'];
      }[];
    };
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export namespace ISubmitQuestionByShortcode {
  export interface Request {
    userId: number;
    response: {
      shortcode: QuestionnaireSteps['question']['shortcode'];
      response: string | number | boolean;
    };
  }
  export interface Response {
    success: boolean;
    result?:
      | {
          questionnaireStatus: Questionnaire;
        }
      | IGetQuestionnaire.Response['result'];
    error?:
      | Record<string, any>
      | {
          status: number;
          message: string;
        };
  }
}

export interface IQuestionnaireController {
  getQuestionnaire: (
    payload: IGetQuestionnaire.Request,
    context: RmqContext,
  ) => Promise<IGetQuestionnaire.Response>;
  submitQuestionByShortcode: (
    payload: ISubmitQuestionByShortcode.Request,
    context: RmqContext,
  ) => Promise<ISubmitQuestionByShortcode.Response>;
}
