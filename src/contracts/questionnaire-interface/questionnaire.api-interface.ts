import { RmqContext } from '@nestjs/microservices';
import { QuestionnaireSteps } from '../db/models/questionnaire-steps.entity';
import { Questionnaire } from '../db/models/questionnaire.entity';
import { BaseResponse } from '../types';

export const QUESTIONNAIRE_MSG_PATTERNS = {
  GET_QUESTIONNAIRE: 'get_questionnaire',
  SUBMIT_QUESTIONNAIRE: 'susbmit_questionnaire',
};

interface Question {
  answered: boolean;
  response?: string | number | boolean;
  question: QuestionnaireSteps['question'];
}

export namespace IGetQuestionnaire {
  export interface Request {
    userId: number;
  }
  export interface Response extends BaseResponse {
    result?: {
      started: boolean;
      completed: boolean;
      questions?: Question[];
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
  export interface Response extends BaseResponse {
    result?:
      | {
          questionnaireStatus: Questionnaire;
        }
      | IGetQuestionnaire.Response['result'];
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
