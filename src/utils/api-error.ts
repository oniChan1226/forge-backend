export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly message: string;
  constructor(statusCode: number = 500, message: string = "Something went wrong", isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    this.name = "AppError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
