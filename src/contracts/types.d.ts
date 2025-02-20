type ApiError =
  | Record<string, any>
  | {
      status: number;
      message: string;
    };

export interface BaseResponse {
  success: boolean;
  error?: ApiError;
}
