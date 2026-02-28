export interface ApiError {
  code: string;
  message: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: ApiError;
}
