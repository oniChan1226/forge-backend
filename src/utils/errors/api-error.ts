export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly message: string;
  public readonly details: unknown;
  constructor(statusCode: number = 500, message: string = "Something went wrong", isOperational: boolean = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    this.details = details;
    this.name = "Api Error";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
