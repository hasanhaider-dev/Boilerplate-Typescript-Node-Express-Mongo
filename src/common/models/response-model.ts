export interface ResponseModel<T> {
  message: string;
  payload: Record<string, T>;
  statusCode: string;
  hasError: boolean;
}
